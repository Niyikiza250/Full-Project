-- ============================================================================
-- MIFEM Management Information System — Member Registration Database Schema
-- Database: PostgreSQL 15+
-- Description: Core schema for member registration, contact info, emergency
--              contacts, ministry roles, and geographic data.
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENUM TYPES ────────────────────────────────────────────────────────────

CREATE TYPE member_status AS ENUM ('ACTIVE', 'INACTIVE', 'TRANSFERRED', 'DECEASED');
CREATE TYPE member_role AS ENUM (
    'SUPER_ADMIN', 'UNION_LEADER', 'FIELD_ADMINISTRATOR', 'FIELD_LEADER',
    'DISTRICT_LEADER', 'CHURCH_LEADER', 'MINISTRY_LEADER', 'MEMBER', 'VOLUNTEER'
);
CREATE TYPE age_group AS ENUM ('YOUTH', 'YOUNG_ADULT', 'ADULT', 'SENIOR');
CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE');
CREATE TYPE change_request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE change_request_type AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- ─── ORGANIZATIONAL HIERARCHY ──────────────────────────────────────────────

CREATE TABLE unions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    code        VARCHAR(10) UNIQUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fields (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL,
    code        VARCHAR(10),
    union_id    UUID NOT NULL REFERENCES unions(id) ON DELETE CASCADE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, union_id)
);

CREATE TABLE zones (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL,
    field_id    UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, field_id)
);

CREATE TABLE churches (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(150) NOT NULL,
    zone_id     UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, zone_id)
);

-- ─── USER / AUTH TABLE ─────────────────────────────────────────────────────

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            member_role NOT NULL DEFAULT 'MEMBER',
    church_id       UUID REFERENCES churches(id),
    account_status  VARCHAR(20) DEFAULT 'ACTIVE',
    must_change_pwd BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ─── MEMBER REGISTRATION TABLE ─────────────────────────────────────────────

CREATE TABLE members (
    -- Primary identification
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Personal information
    first_name      VARCHAR(50) NOT NULL,
    last_name       VARCHAR(50) NOT NULL,
    gender          gender_type NOT NULL,
    date_of_birth   DATE,
    age_group       age_group,
    image_url       TEXT,

    -- Contact information
    email           VARCHAR(255),
    phone           VARCHAR(20) NOT NULL,
    whatsapp        VARCHAR(20),

    -- Church affiliation
    church_id       UUID NOT NULL REFERENCES churches(id),
    sabbath_class   VARCHAR(100),
    role            member_role NOT NULL DEFAULT 'MEMBER',
    status          member_status NOT NULL DEFAULT 'ACTIVE',
    baptism_date    DATE,
    join_date       DATE DEFAULT CURRENT_DATE,

    -- Address (Rwanda administrative hierarchy)
    address         TEXT,
    village         VARCHAR(100),
    sector          VARCHAR(100),
    district        VARCHAR(100),

    -- Emergency contact
    emergency_name  VARCHAR(100) NOT NULL,
    emergency_phone VARCHAR(20) NOT NULL,

    -- Audit
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX idx_members_church ON members(church_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_name ON members(last_name, first_name);
CREATE INDEX idx_members_district ON members(district);
CREATE INDEX idx_members_age_group ON members(age_group);
CREATE INDEX idx_members_gender ON members(gender);
CREATE INDEX idx_members_phone ON members(phone);

-- Full-text search index for name search
CREATE INDEX idx_members_name_search ON members
    USING GIN (to_tsvector('simple', first_name || ' ' || last_name));

-- ─── MINISTRY ROLES (many-to-many) ─────────────────────────────────────────

CREATE TYPE ministry_role_type AS ENUM (
    'CHOIR', 'OUTREACH', 'TEACHING', 'HOSPITALITY', 'DEACON', 'ELDER',
    'SABBATH_SCHOOL_TEACHER', 'PATHFINDER_LEADER', 'ADVENTIST_YOUTH_LEADER',
    'COMMUNITY_SERVICES', 'OTHER'
);

CREATE TABLE member_ministry_roles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    role        ministry_role_type NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id),
    UNIQUE(member_id, role)
);

CREATE INDEX idx_member_ministry_member ON member_ministry_roles(member_id);
CREATE INDEX idx_member_ministry_role ON member_ministry_roles(role);

-- ─── MEMBER CHANGE REQUESTS ────────────────────────────────────────────────

CREATE TABLE member_change_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id       UUID REFERENCES members(id) ON DELETE SET NULL,
    type            change_request_type NOT NULL,
    changes         JSONB NOT NULL,
    submitted_by    UUID NOT NULL REFERENCES users(id),
    submitted_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status          change_request_status NOT NULL DEFAULT 'PENDING',
    reviewed_by     UUID REFERENCES users(id),
    reviewed_at     TIMESTAMP,
    rejection_reason TEXT
);

CREATE INDEX idx_change_requests_status ON member_change_requests(status);
CREATE INDEX idx_change_requests_submitted ON member_change_requests(submitted_by);

-- ─── AUDIT LOG ─────────────────────────────────────────────────────────────

CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action      VARCHAR(100) NOT NULL,
    target      JSONB,
    actor       JSONB,
    severity    VARCHAR(10) DEFAULT 'INFO',
    at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_at ON audit_logs(at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ─── HELPER VIEWS ──────────────────────────────────────────────────────────

-- Member directory view with church hierarchy
CREATE VIEW member_directory AS
SELECT
    m.id,
    m.first_name,
    m.last_name,
    m.email,
    m.phone,
    m.whatsapp,
    m.gender,
    m.date_of_birth,
    m.age_group,
    m.status,
    m.role AS member_role,
    m.sabbath_class,
    m.baptism_date,
    m.join_date,
    m.address,
    m.village,
    m.sector,
    m.district,
    m.emergency_name,
    m.emergency_phone,
    m.image_url,
    c.name AS church_name,
    z.name AS zone_name,
    f.name AS field_name,
    u.name AS union_name,
    m.created_at,
    m.updated_at
FROM members m
    LEFT JOIN churches c ON m.church_id = c.id
    LEFT JOIN zones z ON c.zone_id = z.id
    LEFT JOIN fields f ON z.field_id = f.id
    LEFT JOIN unions u ON f.union_id = u.id;

-- Demographics summary view
CREATE VIEW member_demographics AS
SELECT
    c.name AS church_name,
    z.name AS zone_name,
    f.name AS field_name,
    m.gender,
    m.age_group,
    m.status,
    COUNT(*) AS member_count
FROM members m
    LEFT JOIN churches c ON m.church_id = c.id
    LEFT JOIN zones z ON c.zone_id = z.id
    LEFT JOIN fields f ON z.field_id = f.id
GROUP BY c.name, z.name, f.name, m.gender, m.age_group, m.status;

-- ─── SAMPLE DATA ───────────────────────────────────────────────────────────

-- Insert union
INSERT INTO unions (name, code) VALUES ('Rwanda Union Mission', 'RUM');

-- Insert fields
INSERT INTO fields (name, code, union_id)
SELECT f.name, f.code, u.id
FROM (VALUES
    ('Central Rwanda Field', 'CRF'),
    ('West Rwanda Field', 'WRF'),
    ('East Rwanda Field', 'ERF'),
    ('North Rwanda Field', 'NRF'),
    ('South Rwanda Field', 'SRF')
) AS f(name, code)
CROSS JOIN unions u WHERE u.code = 'RUM';

-- Insert sample zones (districts)
INSERT INTO zones (name, field_id)
SELECT z.name, f.id
FROM (VALUES
    ('Kigali District', 'Gasabo'),
    ('Kigali District', 'Kicukiro'),
    ('Kigali District', 'Nyarugenge'),
    ('Musanze District', 'Musanze'),
    ('Huye District', 'Huye')
) AS z(district, name)
JOIN fields f ON f.code = 'CRF';

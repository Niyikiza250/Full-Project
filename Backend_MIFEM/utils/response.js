const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const error = (res, message = 'Server error', statusCode = 500, errors = null) => {
  const body = {
    success: false,
    message,
  };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

const paginated = (res, rows, total, page, limit) => {
  return res.status(200).json({
    success: true,
    data: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};

module.exports = { success, error, paginated };

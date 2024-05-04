export function response(statusCode: number, responseData: object): Response {
  return Response.json(
    {
      success: true,
      ...responseData,
    },
    {
      status: statusCode,
    }
  );
}

export function errorResponse(
  statusCode: number,
  responseData: object
): Response {
  return Response.json(
    {
      success: false,
      ...responseData,
    },
    {
      status: statusCode,
    }
  );
}

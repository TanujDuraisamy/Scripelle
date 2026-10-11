import { catchAsync, sendResponse } from "../utils/httpWrapper";

export const pingPong = catchAsync(async (_req, res) => {
  sendResponse(res, "Pong");
});

import { logger } from "./logger.js";

async function tryCatch(promise) {
  try {
    const data = await promise;
    return { data, err: null };
  } catch (err) {
    logger.info(err);
    return { data: null, err };
  }
}

export default tryCatch;

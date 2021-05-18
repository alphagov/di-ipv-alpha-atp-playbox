/*!
 * MIT License
 *
 * Copyright (c) 2021 Government Digital Service
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { getHealthState as authHealthState } from "./api/authentication";
import { HealthCheckError } from "@godaddy/terminus";

enum HealthCheckState {
  UP = "UP",
  DOWN = "DOWN",
}

const onHealthCheck = async (): Promise<any> => {
  const errors = [];
  // Populate this array with the health checks.
  return Promise.all(
    [
      authHealthState(),
      // Gracefully catch all errors that the health checks would throw
    ].map((p) =>
      p.catch((error) => {
        // Add them into an array
        errors.push(error);
        return undefined;
      })
    )
  ).then(() => {
    // If we happen to receive any errors, throw new health check error
    // with the error array that contains error descriptions.
    if (errors.length) {
      throw new HealthCheckError(
        "health check failed",
        errors.map((e) => e.message)
      );
    }
  });
};

export { onHealthCheck, HealthCheckState };
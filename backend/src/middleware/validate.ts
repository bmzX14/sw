import { NextFunction, Request, Response } from "express";

// Ensure required request body fields exist before reaching the controller.
export function validate(requiredFields: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const missing = requiredFields.filter((field) => !req.body[field]);

        if (missing.length > 0) {
            return res.status(400).json({
                error: `Missing fields: ${missing.join(", ")}`,
            });
        }

        next();
    };
}

export default validate;

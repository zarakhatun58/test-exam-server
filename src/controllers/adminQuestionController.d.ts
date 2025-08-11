import { Request, Response } from 'express';
export declare const getQuestions: (req: Request, res: Response) => Promise<void>;
export declare const createQuestion: (req: Request, res: Response) => Promise<void>;
export declare const updateQuestion: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteQuestion: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=adminQuestionController.d.ts.map
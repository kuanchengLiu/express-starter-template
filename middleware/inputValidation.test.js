const handleErrorsAsync = require('../middleware/inputValidation');
const ValidationError = require('../public/errors/validationError');

describe('handleErrorsAsync', () => {
    const mockSchema = jest.fn().mockResolvedValue({
        validate: jest.fn().mockReturnValue({ error: null })
    });

    const mockFn = jest.fn();

    const mockReq = {
        body: { key: 'value' },
        query: {}
    };

    const mockRes = {};
    const mockNext = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should call the wrapped function if schema is null', async () => {
        const middleware = handleErrorsAsync(mockFn, null);
        await middleware(mockReq, mockRes, mockNext);
        expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    });

    test('should call the wrapped function if validation passes', async () => {
        const mockValidationResult = { error: null };
        const mockValidate = jest.fn().mockReturnValue(mockValidationResult);
        const mockTempSchema = { validate: mockValidate };
        mockSchema.mockResolvedValueOnce(mockTempSchema);

        const middleware = handleErrorsAsync(mockFn, mockSchema);
        await middleware(mockReq, mockRes, mockNext);

        expect(mockSchema).toHaveBeenCalled();
        expect(mockValidate).toHaveBeenCalledWith(mockReq.body);
        expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    });

    test('should throw a ValidationError if validation fails', async () => {
        const mockValidationResult = {
            error: {
                details: [
                    {
                        message: 'Validation error',
                        type: 'validationError'
                    }
                ]
            }
        };
        const mockValidate = jest.fn().mockReturnValue(mockValidationResult);
        const mockTempSchema = { validate: mockValidate };
        mockSchema.mockResolvedValueOnce(mockTempSchema);

        const middleware = handleErrorsAsync(mockFn, mockSchema);
        await middleware(mockReq, mockRes, mockNext);

        expect(mockSchema).toHaveBeenCalled();
        expect(mockValidate).toHaveBeenCalledWith(mockReq.body);
        expect(mockNext).toHaveBeenCalledWith(
            new ValidationError('Validation error', 'validationError', 400, true)
        );
        expect(mockFn).not.toHaveBeenCalled();
    });

    test('should pass caught errors to the next middleware', async () => {
        const mockError = new Error('Some error');
        mockFn.mockRejectedValueOnce(mockError);

        const middleware = handleErrorsAsync(mockFn, mockSchema);
        await middleware(mockReq, mockRes, mockNext);

        expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledWith(mockError);
    });
});
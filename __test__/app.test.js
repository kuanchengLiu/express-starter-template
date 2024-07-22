const FS = require('fs');
//const ConfigMaps = require('../config/configMaps');
let RegexConfig;

jest.mock('fs');
jest.mock('../config/configMaps', () => ({
    DefaultValues: {
        ConfigmapPath_REGEX: './configmaps/regex.json',
        ConfigmapLocalPath_REGEX: './configmaps/regex.json'
    }
}));
//RegexConfig = require('../public/constants/regexConfig.js');  // Adjust the path accordingly

describe('RegexConfig', () => {
    const mockConfig = {
        RegMapping: {
            'someKey': ['field1', 'field2']
        },
        RegularExpression: {
            'someKey': '^[a-zA-Z0-9]+$'
        }
    };
    beforeAll(() => {
        // Mock the FS module to return our mockConfig when reading the config file
        FS.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

        // Set environment variable to ensure the correct config path is used
        process.env.CONFIG_ENVIRONMENT_PROFILE = 'test';
        RegexConfig = require('../public/constants/regexConfig.js');  // Adjust the path accordingly

    });
    test('should load regex config from file', () => {
        console.log('.................' + RegexConfig.path);
        //RegexConfig.initialize();
        expect(mockConfig.RegMapping).toEqual(mockConfig.RegMapping);
        expect(mockConfig.RegularExpression).toEqual(mockConfig.RegularExpression);
    });

});
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
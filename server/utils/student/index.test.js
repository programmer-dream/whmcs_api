const studentUtils = require('./index')

describe('StudentUtils', () => {
    describe('getModuleValue', () => {
        it('should return an empty string if module is undefined', () => {
            const actual = studentUtils.getModuleValue()
            const expected = ''
            expect(actual).toEqual(expected)
        })

        it('should return the module if there is a value', () => {
            const actual = studentUtils.getModuleValue('Module 1')
            const expected = 'Module 1'
            expect(actual).toEqual(expected)
        })
    })

    describe('parseModules', () => {
        it('should return an object with the modules', () => {
            const modules = ['Module 1', undefined, 'Module 2', undefined, undefined]
            const actual = studentUtils.parseModules(modules)
            const expected = {
                1: 'Module 1',
                2: '',
                3: 'Module 2',
                4: '',
                5: ''
            }
            expect(actual).toEqual(expected)
        })
    })

    describe('encodeModules', () => {
        it('should encode the modules', () => {
            const modules = ['Module 1', undefined, 'Module 2', undefined, undefined]
            const actual = studentUtils.encodeModules(modules)
            const expected = 'YTo1OntpOjE7czo4OiJNb2R1bGUgMSI7aToyO3M6MDoiIjtpOjM7czo4OiJNb2R1bGUgMiI7aTo0O3M6MDoiIjtpOjU7czowOiIiO30='
            expect(actual).toEqual(expected)
        })
    })
})
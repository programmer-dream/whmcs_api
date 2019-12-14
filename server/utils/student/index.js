const base64_encode = require('locutus/php/url/base64_encode')
const serialize = require('locutus/php/var/serialize')

const encodeModules = (modules) => {
    const parsedModules = parseModules(modules)
    const serialiseModules = serialize(parsedModules)
    const encodeModules = base64_encode(serialiseModules)
    return encodeModules
}

const parseModules = (modules) => {
    const parsedModules = {}
    for (let i = 0; i < modules.length; i++) {
        parsedModules[i + 1] = getModuleValue(modules[i])
    }
    return parsedModules
}

const getModuleValue = (module) => {
    if(module == undefined) return ""
    return module
}

module.exports = {
    encodeModules,
    parseModules,
    getModuleValue
}
/**
 * Funções de processamento para máscaras
 * Estas funções removem ou processam valores mascarados
 */

/**
 * Remover qualquer máscara de um valor (para envio ao backend)
 * @param {string} value - Valor com máscara
 * @returns {string} Valor sem máscara
 */
export const unmask = (value) => {
    if (!value) return '';
    return value.replace(/\D/g, '');
};

/**
* Formata uma placa de veículo para exibição conforme padrões brasileiros
* Suporta tanto o formato antigo (ABC-1234) quanto o formato Mercosul (ABC1D23)
* 
* @param {string} plate - Placa de veículo (com ou sem formatação)
* @returns {string} Placa formatada conforme seu padrão correspondente
* 
* @example
* // Formato antigo
* formatLicensePlate('ABC1234') // Retorna 'ABC-1234'
* formatLicensePlate('abc-1234') // Retorna 'ABC-1234'
* 
* // Formato Mercosul
* formatLicensePlate('ABC1D23') // Retorna 'ABC1D23'
* formatLicensePlate('abc1d23') // Retorna 'ABC1D23'
*/
export const formatLicensePlate = (plate) => {
    if (!plate) return '';
    
    const cleaned = plate.replace(/[^a-zA-Z0-9]/g, '');
    
    // Verifica o formato Mercosul (3 letras + 1 número + 1 letra + 2 números)
    if (/^[A-Za-z]{3}[0-9][A-Za-z][0-9]{2}$/.test(cleaned)) {
        const p1 = cleaned.substring(0, 3).toUpperCase();
        const p2 = cleaned.substring(3, 4);
        const p3 = cleaned.substring(4, 5).toUpperCase();
        const p4 = cleaned.substring(5, 7);
        return `${p1}${p2}${p3}${p4}`;
    }
    
    // Formato antigo (3 letras + 4 números)
    if (cleaned.length >= 7) {
        const letters = cleaned.substring(0, 3).toUpperCase();
        const numbers = cleaned.substring(3, 7);
        return `${letters}-${numbers}`;
    }
    
    return plate;
};

/**
 * Remover caracteres especiais mantendo letras e números
 * @param {string} value - Valor com caracteres especiais
 * @returns {string} Valor com apenas letras e números
 */
export const unmaskAlphanumeric = (value) => {
    if (!value) return '';
    return value.replace(/[^\w]/g, '');
};

/**
 * Remover máscara e formatar placa de veículo para envio ao backend
 * @param {string} value - Placa com ou sem máscara
 * @returns {string} Placa formatada para envio ao backend
 */
export const unmaskPlaca = (value) => {
    if (!value) return '';

    // Remove caracteres especiais e converte para maiúsculo
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Se não tiver 7 caracteres, retorna o valor limpo como está
    if (cleaned.length !== 7) return cleaned;

    // Verifica se é formato Mercosul (3 letras + 1 número + 1 letra + 2 números)
    const isMercosul = /[A-Z]{3}[0-9][A-Z][0-9]{2}/.test(cleaned);

    // Verifica se é formato antigo (3 letras + 4 números)
    const isOldFormat = /[A-Z]{3}[0-9]{4}/.test(cleaned);

    // Se for um dos formatos válidos, retorna como está
    if (isMercosul || isOldFormat) {
        return cleaned;
    }

    // Caso contrário, tenta verificar se é próximo de algum formato conhecido
    // Verifica se o 4º caractere é numérico (formato Mercosul potencial)
    if (/\d/.test(cleaned[3])) {
        // Potencialmente formato Mercosul
        return cleaned;
    }

    // Em outros casos, retorna o valor limpo
    return cleaned;
};

/**
 * Processa valor de entrada para formulários/APIs
 * Converte string para número e trata valores vazios
 * @param {string} value - Valor a ser processado
 * @param {string} type - Tipo de dado ('int', 'float', ou vazio para string)
 * @returns {number|string|null} Valor processado
 */
export const processInputValue = (value, type) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    if (type === 'int') {
        return parseInt(unmask(value), 10) || null;
    }

    if (type === 'float') {
        // Convert comma to dot for JS float parsing
        const numStr = value.toString().replace(',', '.');
        return parseFloat(numStr) || null;
    }

    return value; // return as string
};

/**
 * Processa um array de valores para submissão ao backend
 * @param {Object} data - Objeto com dados a serem processados
 * @param {Object} config - Configuração de campos {campo: tipo}
 * @returns {Object} Dados processados
 */
export const processFormData = (data, config = {}) => {
    const result = { ...data };

    Object.entries(config).forEach(([field, type]) => {
        if (data[field] !== undefined) {
            result[field] = processInputValue(data[field], type);
        }
    });

    return result;
};

/**
* Remove máscara e valida quilometragem formatada
* @param {string} value - Valor com máscara (ex: 1.234,56 km)
* @returns {number|null} Valor numérico ou null se inválido
*/
export const unmaskQuilometragem = (value) => {
    if (!value) return null;

    // Remove texto e mantém apenas números e ponto decimal
    const cleaned = value.replace(/[^0-9,]/g, '').replace(',', '.');

    // Converte para float e valida intervalo
    const numericValue = parseFloat(cleaned);
    return !isNaN(numericValue) && numericValue >= 0 && numericValue <= 999999.99
        ? numericValue
        : null;
};

export default {
    unmask,
    formatLicensePlate,
    unmaskAlphanumeric,
    unmaskPlaca,
    processInputValue,
    processFormData,
    unmaskQuilometragem
};
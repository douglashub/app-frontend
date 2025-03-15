/**
 * Utilitários para formatação de números no formato brasileiro e para trabalhar
 * com quilometragem em rotas.
 */

/**
 * Converte um número formatado no padrão brasileiro para um valor numérico
 * Aceita valores com vírgula como separador decimal
 * 
 * @param {string|number} value - Valor a ser convertido (ex: "1.234,56" ou "1234,56")
 * @returns {number|null} - Valor numérico ou null se inválido
 */
export const parseNumeroDecimal = (value) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    try {
        // Se já for um número, retorna ele mesmo
        if (typeof value === 'number') {
            return value;
        }

        // Converte para string se não for
        const valorStr = String(value);

        // Remove pontos de milhar e substitui vírgula por ponto
        const valorLimpo = valorStr
            .replace(/\./g, '') // Remove pontos de milhar
            .replace(',', '.'); // Substitui vírgula por ponto

        const numero = parseFloat(valorLimpo);
        return isNaN(numero) ? null : numero;
    } catch (error) {
        console.error('Erro ao converter valor para número:', error);
        return null;
    }
};

/**
 * Formata um número para o padrão brasileiro com vírgula como separador decimal
 * 
 * @param {number|string} value - Valor a ser formatado
 * @param {number} [decimais=2] - Número de casas decimais
 * @returns {string} - Valor formatado (ex: "1.234,56")
 */
export const formatarNumeroDecimal = (value, decimais = 2) => {
    if (value === undefined || value === null || value === '') {
        return '';
    }

    try {
        const numero = typeof value === 'string' ? parseNumeroDecimal(value) : value;

        if (numero === null || isNaN(numero)) {
            return '';
        }

        return numero.toLocaleString('pt-BR', {
            minimumFractionDigits: decimais,
            maximumFractionDigits: decimais
        });
    } catch (error) {
        console.error('Erro ao formatar número:', error);
        return String(value);
    }
};

/**
 * Formata uma distância em quilômetros para exibição
 * Adiciona sufixo "km" e formata o número no padrão brasileiro
 * 
 * @param {number|string} distancia - Valor em quilômetros
 * @param {number} [decimais=1] - Número de casas decimais
 * @returns {string} - Distância formatada (ex: "1.234,5 km")
 */
export const formatarDistanciaKm = (distancia, decimais = 1) => {
    if (distancia === undefined || distancia === null || distancia === '') {
        return '-';
    }

    const valor = formatarNumeroDecimal(distancia, decimais);
    return valor ? `${valor} km` : '-';
};

/**
 * Valida se um valor de quilometragem é válido
 * 
 * @param {string|number} value - Valor a ser validado
 * @returns {boolean} - true se for um valor válido
 */
export const isQuilometragemValida = (value) => {
    if (value === undefined || value === null || value === '') {
        return false;
    }

    const numero = parseNumeroDecimal(value);
    return numero !== null && numero >= 0 && numero <= 100000; // Limite de 100.000 km
};

/**
 * Formata tempo em minutos para horas e minutos
 * 
 * @param {number} minutos - Tempo em minutos
 * @returns {string} - Tempo formatado (ex: "2h 30min")
 */
export const formatarTempoMinutos = (minutos) => {
    if (minutos === undefined || minutos === null || minutos === '' || isNaN(minutos)) {
        return '-';
    }

    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;

    if (horas > 0 && mins > 0) {
        return `${horas}h ${mins}min`;
    } else if (horas > 0) {
        return `${horas}h`;
    } else {
        return `${mins}min`;
    }
};

export default {
    parseNumeroDecimal,
    formatarNumeroDecimal,
    formatarDistanciaKm,
    isQuilometragemValida,
    formatarTempoMinutos
};
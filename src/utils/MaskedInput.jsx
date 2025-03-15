import React from 'react';
import { PatternFormat } from 'react-number-format';

/**
 * Componente para campos de entrada com máscara
 * 
 * @param {string} format - Padrão da máscara (ex: '###.###.###-##')
 * @param {string} name - Nome do campo
 * @param {string} id - ID do campo
 * @param {string} value - Valor do campo
 * @param {function} onChange - Função de callback para mudanças
 * @param {string} label - Texto do label (opcional)
 * @param {boolean} required - Se o campo é obrigatório
 * @param {string} placeholder - Placeholder para o campo
 * @param {string} className - Classes CSS adicionais
 * @param {object} props - Propriedades adicionais
 */
const MaskedInput = React.forwardRef(({ 
  mask,
  format,
  name,
  id,
  value,
  onChange,
  label,
  required = false,
  placeholder = '',
  className = '',
  ...props
}, ref) => {
  // Converter máscara do formato react-input-mask para formato de react-number-format
  // Ex: "99/99/9999" para "##/##/####"
  const convertMask = (inputMask) => {
    if (!inputMask) return format || '';
    return inputMask.replace(/9/g, '#').replace(/a/g, '*');
  };

  const handleChange = (e) => {
    // Simular um evento para manter a compatibilidade com os outros componentes
    if (onChange) {
      const syntheticEvent = {
        target: {
          name: name,
          value: e.value
        }
      };
      onChange(syntheticEvent);
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <PatternFormat
        format={format || convertMask(mask)}
        valueIsNumericString={false}
        id={id}
        name={name}
        value={value}
        onValueChange={handleChange}
        placeholder={placeholder}
        className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${className}`}
        getInputRef={ref}
        {...props}
      />
    </div>
  );
});

export default MaskedInput;
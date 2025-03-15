import React, { useState, useEffect, useRef } from 'react';
import { MASK_CHARS } from '../constants';

/**
 * Componente para campos de entrada com máscara
 * Implementação personalizada com funcionalidade similar ao PatternFormat
 * 
 * @param {string} mask - Padrão da máscara no formato react-input-mask (ex: "99/99/9999")
 * @param {string} format - Padrão da máscara no formato react-number-format (ex: "##/##/####")
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
  // Converter máscara para formato padrão interno
  const getStandardMask = () => {
    if (format) return format.replace(/#/g, '9').replace(/\*/g, 'a');
    if (mask) return mask;
    return '';
  };
  
  const standardMask = getStandardMask();
  const [inputValue, setInputValue] = useState(value || '');
  const inputRef = useRef(null);
  
  // Atualiza o valor quando a prop value muda
  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  // Aplica a máscara ao valor
  const applyMask = (val) => {
    if (!val) return '';
    if (!standardMask) return val;
    
    let result = '';
    let valueIndex = 0;
    
    // Percorre cada caractere da máscara
    for (let i = 0; i < standardMask.length && valueIndex < val.length; i++) {
      const maskChar = standardMask[i];
      
      // Define o padrão baseado no caractere da máscara
      let pattern;
      if (maskChar === '9') {
        pattern = /[0-9]/;
      } else if (maskChar === 'a') {
        pattern = /[a-zA-Z]/;
      } else if (maskChar === '*') {
        pattern = /[0-9a-zA-Z]/;
      } else {
        // Caractere estático da máscara
        result += maskChar;
        
        // Pula o caractere do valor se for igual ao caractere da máscara
        if (val[valueIndex] === maskChar) {
          valueIndex++;
        }
        continue;
      }
      
      // Procura o próximo caractere válido
      while (valueIndex < val.length) {
        const char = val[valueIndex];
        valueIndex++;
        
        if (pattern.test(char)) {
          result += char;
          break;
        }
      }
    }
    
    return result;
  };

  // Manipula a mudança de valor
  const handleChange = (e) => {
    const rawValue = e.target.value;
    const maskedValue = applyMask(rawValue);
    
    setInputValue(maskedValue);
    
    if (onChange) {
      // Simular um evento similar ao formato do react-number-format
      onChange({
        target: {
          name: name,
          value: maskedValue
        },
        value: maskedValue // Compatível com a API do react-number-format
      });
    }
  };

  // Manipula a operação de paste
  const handlePaste = (e) => {
    setTimeout(() => {
      const rawValue = e.target.value;
      const maskedValue = applyMask(rawValue);
      
      setInputValue(maskedValue);
      
      if (onChange) {
        onChange({
          target: {
            name: name,
            value: maskedValue
          },
          value: maskedValue
        });
      }
    }, 0);
  };

  // Manipula as referências
  const handleRef = (el) => {
    inputRef.current = el;
    
    // Compatibilidade com getInputRef do react-number-format
    if (ref) {
      if (typeof ref === 'function') {
        ref(el);
      } else {
        ref.current = el;
      }
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        ref={handleRef}
        type="text"
        id={id}
        name={name}
        value={inputValue}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder={placeholder}
        className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${className}`}
        {...props}
      />
    </div>
  );
});

export default MaskedInput;
import React, { useState, useEffect, useRef } from "react";

/**
 * Componente para entrada de placas de veículos com detecção automática de formato
 * Suporta formato Mercosul (AAA0A00) e tradicional (AAA-0000)
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.value - Valor atual da placa
 * @param {function} props.onChange - Função chamada quando o valor muda
 * @param {string} props.name - Nome do campo
 * @param {string} props.className - Classes CSS adicionais
 * @param {string} props.placeholder - Texto de placeholder
 * @param {Object} props.rest - Outras propriedades do input
 * @param {React.Ref} ref - Referência para o input
 */
const PlacaInput = React.forwardRef(({ 
  value, 
  onChange, 
  name = "placa", 
  className = "border rounded p-2 w-full uppercase",
  placeholder = "Digite a placa do veículo",
  ...rest
}, ref) => {
  const [inputValue, setInputValue] = useState(value || "");
  const inputRef = useRef(null);
  
  // Determina o padrão de máscara baseado no valor de entrada
  const getMaskPattern = (val) => {
    const cleanVal = val.replace(/[^\w]/g, '').toUpperCase();
    
    // Verifica formato Mercosul: 3 letras + 1 número + 1 letra + 2 números
    const mercosul = /([A-Z]{3}[0-9]{1}[A-Z]{1})/;
    
    // Verifica formato tradicional: 3 letras + 2 números
    const normal = /([A-Z]{3}[0-9]{2})/;
    
    if (normal.test(cleanVal)) {
      return "SSS-0000"; // Formato tradicional
    } else if (mercosul.test(cleanVal)) {
      return "SSS0A00"; // Formato Mercosul
    }
    
    // Se não houver caracteres suficientes para determinar, usa uma máscara flexível
    return "SSS0A00"; // Padrão para Mercosul como é o formato atual
  };
  
  // Aplica a máscara ao valor
  const applyMask = (val, pattern) => {
    let cleanVal = val.replace(/[^\w]/g, '').toUpperCase();
    let result = '';
    let charIndex = 0;
    
    // Limita a 7 caracteres (o conteúdo real da placa)
    cleanVal = cleanVal.slice(0, 7);
    
    // Aplica o padrão
    for (let i = 0; i < pattern.length && charIndex < cleanVal.length; i++) {
      const patternChar = pattern[i];
      
      if (patternChar === 'S') {
        // 'S' é para letras (A-Z)
        if (/[A-Z]/.test(cleanVal[charIndex])) {
          result += cleanVal[charIndex];
          charIndex++;
        } else {
          // Pula caracteres não-letra para posições 'S'
          charIndex++;
          i--; // Tenta esta posição de padrão novamente
        }
      } else if (patternChar === '0') {
        // '0' é para números (0-9)
        if (/[0-9]/.test(cleanVal[charIndex])) {
          result += cleanVal[charIndex];
          charIndex++;
        } else {
          // Pula caracteres não-número para posições '0'
          charIndex++;
          i--; // Tenta esta posição de padrão novamente
        }
      } else if (patternChar === 'A') {
        // 'A' é para letras (A-Z)
        if (/[A-Z]/.test(cleanVal[charIndex])) {
          result += cleanVal[charIndex];
          charIndex++;
        } else {
          // Pula caracteres não-letra para posições 'A'
          charIndex++;
          i--; // Tenta esta posição de padrão novamente
        }
      } else if (patternChar === '-') {
        // Adiciona hífen para formato tradicional
        result += '-';
      } else {
        // Adiciona qualquer outro caractere do padrão como está
        result += patternChar;
        
        // Se o caractere do padrão corresponder ao caractere de entrada, consuma-o
        if (patternChar === cleanVal[charIndex]) {
          charIndex++;
        }
      }
    }
    
    return result;
  };
  
  // Formata o valor de acordo com o padrão detectado
  const formatValue = (val) => {
    // Remove qualquer caractere de máscara existente
    const cleanVal = val.replace(/[^\w]/g, '').toUpperCase();
    
    // Se vazio, retorna vazio
    if (!cleanVal) return '';
    
    // Determina o padrão de máscara apropriado
    const pattern = getMaskPattern(cleanVal);
    
    // Aplica a máscara
    return applyMask(cleanVal, pattern);
  };

  // Manipula a alteração do input
  const handleChange = (e) => {
    const rawValue = e.target.value.toUpperCase();
    
    // Formata o valor
    const formatted = formatValue(rawValue);
    setInputValue(formatted);
    
    // Cria um evento sintético para onChange
    const syntheticEvent = {
      target: {
        name: e.target.name,
        value: formatted
      }
    };
    
    onChange && onChange(syntheticEvent);
  };

  // Manipula o evento de colar (paste)
  const handlePaste = (e) => {
    // Deixa a colagem acontecer, depois formata no próximo ciclo
    setTimeout(() => {
      const rawValue = e.target.value.toUpperCase();
      const formatted = formatValue(rawValue);
      setInputValue(formatted);
      
      // Cria um evento sintético para onChange
      const syntheticEvent = {
        target: {
          name: e.target.name,
          value: formatted
        }
      };
      
      onChange && onChange(syntheticEvent);
    }, 0);
  };

  // Inicializa o valor formatado quando o componente é montado ou o valor prop muda
  useEffect(() => {
    if (value) {
      const formatted = formatValue(value);
      setInputValue(formatted);
    } else {
      setInputValue("");
    }
  }, [value]);

  // Lida com o encaminhamento de ref
  const setRef = (element) => {
    // Define a ref interna
    inputRef.current = element;
    
    // Encaminha a ref
    if (ref) {
      if (typeof ref === 'function') {
        ref(element);
      } else {
        ref.current = element;
      }
    }
  };

  return (
    <input
      ref={setRef}
      type="text"
      name={name}
      className={className}
      value={inputValue}
      onChange={handleChange}
      onPaste={handlePaste}
      placeholder={placeholder}
      maxLength={8} // O formato mais longo é AAA-0000 (8 caracteres)
      {...rest}
    />
  );
});

export default PlacaInput;
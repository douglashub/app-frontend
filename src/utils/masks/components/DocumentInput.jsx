import React, { useState, useEffect, useRef } from "react";
import { MASKS } from '../constants';
import { detectDocumentType } from '../detectors';
import MaskedInput from './MaskedInput';

/**
 * Componente de entrada para documentos com detecção automática
 * Suporta CPF e CNPJ, detectando automaticamente o formato
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.value - Valor atual
 * @param {function} props.onChange - Função chamada quando o valor muda
 * @param {string} props.name - Nome do campo
 * @param {string} props.className - Classes CSS adicionais
 * @param {string} props.placeholder - Texto de placeholder
 * @param {Object} props.rest - Outras propriedades do input
 * @param {React.Ref} ref - Referência para o input
 */
const DocumentInput = React.forwardRef(({
  value,
  onChange,
  name = "documento",
  className = "border rounded p-2 w-full",
  placeholder = "CPF ou CNPJ",
  ...rest
}, ref) => {
  const [mask, setMask] = useState(MASKS.CPF);
  const [inputValue, setInputValue] = useState(value || "");
  const inputRef = useRef(null);

  // Define a máscara baseada no valor
  useEffect(() => {
    if (value) {
      const docType = detectDocumentType(value);
      setMask(docType === 'cnpj' ? MASKS.CNPJ : MASKS.CPF);
    }
  }, [value]);

  // Manipula a mudança de valor
  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Detecta o tipo de documento e ajusta a máscara
    const docType = detectDocumentType(newValue);
    const newMask = docType === 'cnpj' ? MASKS.CNPJ : MASKS.CPF;
    setMask(newMask);
    
    // Passa o evento para o onChange
    onChange && onChange(e);
  };

  // Lida com encaminhamento de ref
  const setRef = (el) => {
    inputRef.current = el;
    
    if (ref) {
      if (typeof ref === 'function') {
        ref(el);
      } else {
        ref.current = el;
      }
    }
  };

  return (
    <MaskedInput
      ref={setRef}
      value={inputValue}
      onChange={handleChange}
      mask={mask}
      name={name}
      className={className}
      placeholder={placeholder}
      {...rest}
    />
  );
});

export default DocumentInput;
import React, { useState, useEffect, useRef } from "react";
import { MASKS } from '../constants';
import { detectPhoneType } from '../detectors';
import MaskedInput from './MaskedInput';

/**
 * Componente de entrada para telefones com detecção automática
 * Suporta celular e telefone fixo, detectando automaticamente o formato
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
const PhoneInput = React.forwardRef(({
  value,
  onChange,
  name = "telefone",
  className = "border rounded p-2 w-full",
  placeholder = "Telefone",
  ...rest
}, ref) => {
  const [mask, setMask] = useState(MASKS.PHONE);
  const [inputValue, setInputValue] = useState(value || "");
  const inputRef = useRef(null);

  // Define a máscara baseada no valor
  useEffect(() => {
    if (value) {
      const phoneType = detectPhoneType(value);
      setMask(phoneType === 'fixo' ? MASKS.LANDLINE : MASKS.PHONE);
    }
  }, [value]);

  // Manipula a mudança de valor
  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Detecta o tipo de telefone e ajusta a máscara
    const phoneType = detectPhoneType(newValue);
    const newMask = phoneType === 'fixo' ? MASKS.LANDLINE : MASKS.PHONE;
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

export default PhoneInput;
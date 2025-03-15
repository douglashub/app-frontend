import React, { useState, useEffect, useRef } from "react";

const PlacaInput = React.forwardRef(({ value, onChange, name = "placa", className = "border rounded p-2 w-full uppercase" }, ref) => {
  const [inputValue, setInputValue] = useState(value || "");
  const inputRef = useRef(null);
  
  // Determine mask pattern based on input value
  const getMaskPattern = (val) => {
    const cleanVal = val.replace(/[^\w]/g, '').toUpperCase();
    
    // Check for Mercosul format: 3 letters + 1 number + 1 letter + 2 numbers
    const mercosul = /([A-Z]{3}[0-9]{1}[A-Z]{1})/;
    
    // Check for traditional format: 3 letters + 2 numbers
    const normal = /([A-Z]{3}[0-9]{2})/;
    
    if (normal.test(cleanVal)) {
      return "SSS-0000"; // Traditional format
    } else if (mercosul.test(cleanVal)) {
      return "SSS0A00"; // Mercosul format
    }
    
    // If not enough characters to determine yet, use a flexible mask
    return "SSS0A00"; // Default to Mercosul as it's the current standard
  };
  
  // Apply mask to the value
  const applyMask = (val, pattern) => {
    let cleanVal = val.replace(/[^\w]/g, '').toUpperCase();
    let result = '';
    let charIndex = 0;
    
    // Limit to max 7 chars (the actual content of the plate)
    cleanVal = cleanVal.slice(0, 7);
    
    // Apply the pattern
    for (let i = 0; i < pattern.length && charIndex < cleanVal.length; i++) {
      const patternChar = pattern[i];
      
      if (patternChar === 'S') {
        // 'S' is for letters (A-Z)
        if (/[A-Z]/.test(cleanVal[charIndex])) {
          result += cleanVal[charIndex];
          charIndex++;
        } else {
          // Skip non-letter characters for 'S' positions
          charIndex++;
          i--; // Try this pattern position again
        }
      } else if (patternChar === '0') {
        // '0' is for numbers (0-9)
        if (/[0-9]/.test(cleanVal[charIndex])) {
          result += cleanVal[charIndex];
          charIndex++;
        } else {
          // Skip non-number characters for '0' positions
          charIndex++;
          i--; // Try this pattern position again
        }
      } else if (patternChar === 'A') {
        // 'A' is for letters (A-Z)
        if (/[A-Z]/.test(cleanVal[charIndex])) {
          result += cleanVal[charIndex];
          charIndex++;
        } else {
          // Skip non-letter characters for 'A' positions
          charIndex++;
          i--; // Try this pattern position again
        }
      } else if (patternChar === '-') {
        // Add hyphen for traditional format
        result += '-';
      } else {
        // Add any other character from the pattern as-is
        result += patternChar;
        
        // If the pattern char matches the input char, consume it
        if (patternChar === cleanVal[charIndex]) {
          charIndex++;
        }
      }
    }
    
    return result;
  };
  
  // Format value according to detected pattern
  const formatValue = (val) => {
    // Remove any existing mask characters
    const cleanVal = val.replace(/[^\w]/g, '').toUpperCase();
    
    // If empty, return empty
    if (!cleanVal) return '';
    
    // Determine the appropriate mask pattern
    const pattern = getMaskPattern(cleanVal);
    
    // Apply the mask
    return applyMask(cleanVal, pattern);
  };

  // Handle input change
  const handleChange = (e) => {
    const rawValue = e.target.value.toUpperCase();
    
    // Format the value
    const formatted = formatValue(rawValue);
    setInputValue(formatted);
    
    // Create synthetic event for onChange
    const syntheticEvent = {
      target: {
        name: e.target.name,
        value: formatted
      }
    };
    
    onChange(syntheticEvent);
  };

  // Handle paste event
  const handlePaste = (e) => {
    // Let the paste happen, then format in the next tick
    setTimeout(() => {
      const rawValue = e.target.value.toUpperCase();
      const formatted = formatValue(rawValue);
      setInputValue(formatted);
      
      // Create synthetic event for onChange
      const syntheticEvent = {
        target: {
          name: e.target.name,
          value: formatted
        }
      };
      
      onChange(syntheticEvent);
    }, 0);
  };

  // Initialize the formatted value when component mounts or value prop changes
  useEffect(() => {
    if (value) {
      const formatted = formatValue(value);
      setInputValue(formatted);
    } else {
      setInputValue("");
    }
  }, [value]);

  // Handle ref forwarding
  const setRef = (element) => {
    // Set internal ref
    inputRef.current = element;
    
    // Forward ref
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
      placeholder="Digite a placa do veículo"
      maxLength={8} // Longest format is AAA-0000 (8 chars)
    />
  );
});

export default PlacaInput;
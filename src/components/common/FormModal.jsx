import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import MaskedInput from '../../utils/masks/components/MaskedInput';
import { MASKS } from '../../utils/masks/constants';
import { unmaskQuilometragem } from '../../utils/masks/processors';

FormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  formData: PropTypes.object,
  onInputChange: PropTypes.func,
  maskedFields: PropTypes.object
};

export default function FormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  isSubmitting = false,
  formData = {},
  onInputChange,
  maskedFields = {}
}) {
  // Debug formData whenever it changes
  useEffect(() => {
    console.log('FormModal - formData atualizado:', formData);
  }, [formData]);
  
  // Track quilometragem changes
  useEffect(() => {
    if(formData?.quilometragem) {
      console.log('Valor bruto da quilometragem:', formData.quilometragem);
      console.log('Valor processado:', unmaskQuilometragem(formData.quilometragem));
    }
  }, [formData?.quilometragem]);
  
  // Track distancia_km changes
  useEffect(() => {
    if(formData?.distancia_km) {
      console.log('Valor bruto da distância km:', formData.distancia_km);
      console.log('Valor processado da distância:', unmaskQuilometragem(formData.distancia_km));
    }
  }, [formData?.distancia_km]);
  
  // Enhanced submit handler with debugging
  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Create a FormData object
    const formElements = event.target.elements;
    const formValues = {};
    
    // Debug form elements directly
    console.log('=== ELEMENTOS DO FORMULÁRIO ===');
    for (let i = 0; i < formElements.length; i++) {
      const element = formElements[i];
      if (element.name) {
        console.log(`${element.name}: ${element.value}`);
        // Only add elements with names to our form values
        if (element.type === 'checkbox') {
          formValues[element.name] = element.checked;
        } else {
          formValues[element.name] = element.value;
        }
      }
    }
    
    // Debug formData
    console.log('=== DADOS SENDO ENVIADOS PARA O BACKEND ===');
    console.log('formData do componente:', formData);
    console.log('formValues coletados do form:', formValues);
    
    if(formValues?.quilometragem) {
      console.log('quilometragem (bruto):', formValues.quilometragem);
      console.log('quilometragem (processado):', unmaskQuilometragem(formValues.quilometragem));
    }
    
    if(formValues?.distancia_km) {
      console.log('distancia_km (bruto):', formValues.distancia_km);
      console.log('distancia_km (processado):', unmaskQuilometragem(formValues.distancia_km));
    }
    
    console.log('=====================================');
    
    // Call the original onSubmit function with the collected form values
    onSubmit(event, formValues);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {title}
                </h3>

                <div className="mt-4">
                  <form onSubmit={handleSubmit}>
                    {React.Children.map(children, child => {
                      // Debug each child to see what's being rendered
                      console.log('Rendering child:', child?.props?.name);
                      
                      if (child?.type === 'input' && maskedFields[child.props.name]) {
                        const isQuilometragem = child.props.name === 'quilometragem';
                        
                        // Log input properties
                        console.log(`Input field: ${child.props.name}`, {
                          value: child.props.value,
                          hasValue: !!child.props.value,
                          inFormData: formData?.[child.props.name] !== undefined
                        });
                        
                        const clonedChild = React.cloneElement(child, {
                          component: MaskedInput,
                          mask: MASKS[maskedFields[child.props.name] === 'PLACA' ? 'PLACA_MERCOSUL' : maskedFields[child.props.name]],
                          placeholder: isQuilometragem ? 'Ex: 15000.50 km' : child.props.placeholder,
                          step: isQuilometragem ? '0.01' : child.props.step,
                          onChange: (e) => {
                            console.log(`Changing ${child.props.name} to:`, e.target.value);
                            if (child.props.onChange) child.props.onChange(e);
                            if (onInputChange) onInputChange(e);
                          }
                        });

                        return (
                          <>
                            {clonedChild}
                            {isQuilometragem && formData.quilometragem && !unmaskQuilometragem(formData.quilometragem) && (
                              <div className="text-red-500 text-sm mt-1">
                                Formato inválido! Use números com até 2 casas decimais (Ex: 15000.50)
                              </div>
                            )}
                          </>
                        );
                      }
                      return child;
                    })}

                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                      >
                        {isSubmitting ? (
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : null}
                        Salvar
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
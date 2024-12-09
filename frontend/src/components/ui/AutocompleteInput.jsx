// frontend/src/components/ui/AutocompleteInput.jsx
import React, { useState, useEffect, useRef } from 'react'

const AutocompleteInput = ({
  placeholder = 'Escribe para filtrar...',
  options = [],
  value,
  onChange,
  onSelect,
  className = ''
}) => {
  const [filteredOptions, setFilteredOptions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')
  const wrapperRef = useRef(null)

  useEffect(() => {
    // Filtrar opciones según inputValue
    const filtered = options.filter(opt =>
      opt.label.toLowerCase().includes(inputValue.toLowerCase())
    )
    setFilteredOptions(filtered)
  }, [options, inputValue])

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    onChange && onChange(e.target.value)
    setIsOpen(true)
  }

  const handleSelect = (option) => {
    setInputValue(option.label)
    onSelect && onSelect(option.value)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <input
        type="text"
        className="border p-2 rounded w-full"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute bg-white border rounded shadow-md z-10 w-full mt-1 max-h-40 overflow-auto">
          {filteredOptions.map((opt, idx) => (
            <div
              key={idx}
              className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(opt)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
      {isOpen && filteredOptions.length === 0 && (
        <div className="absolute bg-white border rounded shadow-md z-10 w-full mt-1 p-2 text-sm text-gray-500">
          Sin resultados
        </div>
      )}
    </div>
  )
}

export default AutocompleteInput

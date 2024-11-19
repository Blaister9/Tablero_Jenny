// components/common/Checkbox.jsx
const Checkbox = ({ id, checked, onCheckedChange, className = "" }) => {
    return (
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${className}`}
        />
      </div>
    );
  };
  
  export default Checkbox;
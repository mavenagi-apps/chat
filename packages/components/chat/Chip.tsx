import { RiCloseLine } from "react-icons/ri";

type ChipProps = {
  displayText: string;
  onRemove: () => void;
};

const Chip: React.FC<ChipProps> = ({ displayText, onRemove }) => {
  return (
    <div className="flex text-xs items-center space-x-2 bg-gray-200 px-2 py-1 rounded-full text-gray-700">
      <RiCloseLine className="cursor-pointer" onClick={onRemove} />
      <span>{displayText}</span>
    </div>
  );
};

export default Chip;

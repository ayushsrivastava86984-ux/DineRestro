import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PLATE_COURSE_TYPES } from '../../data/mockData';
import type { PlateCourseItem } from '../../types';

interface PlatePackageEditorProps {
  items: PlateCourseItem[];
  onChange: (items: PlateCourseItem[]) => void;
}

export function PlatePackageEditor({ items, onChange }: PlatePackageEditorProps) {
  const [course, setCourse] = useState<PlateCourseItem['course']>('Welcome Drink');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleAdd = () => {
    if (!itemName.trim()) return;
    const next: PlateCourseItem = {
      id: `pi-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      course,
      itemName: itemName.trim(),
      quantity: quantity.trim() || '1 Serving',
    };
    onChange([...items, next]);
    setItemName('');
    setQuantity('');
  };

  const handleUpdate = (
    id: string,
    field: 'itemName' | 'quantity' | 'course',
    value: string
  ) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemove = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-3 border border-[#E8DDD1] rounded-lg p-4 bg-[#FFF6E9]/45">
      <div>
        <p className="text-xs font-semibold text-[#292321]">
          Plate-Wise Included Food Items
        </p>
        <p className="text-[11px] text-[#6B5F5C]">
          Define the Welcome Drink, Starter, Main Course, Bread, Rice, Dessert, and extras included in every plate.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        <select
          value={course}
          onChange={(e) => setCourse(e.target.value as PlateCourseItem['course'])}
          className="sm:col-span-4 px-2.5 py-2 text-xs bg-white border border-[#E8DDD1] rounded-lg"
        >
          {PLATE_COURSE_TYPES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Dish / item name (e.g., Kesar Thandai)"
          className="sm:col-span-4 px-2.5 py-2 text-xs bg-white border border-[#E8DDD1] rounded-lg"
        />
        <input
          type="text"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Qty (e.g., 2 Pcs / 1 Bowl)"
          className="sm:col-span-2 px-2.5 py-2 text-xs bg-white border border-[#E8DDD1] rounded-lg"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="sm:col-span-2 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-[#702C3A] rounded-lg hover:bg-[#58202C]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-[#6B5F5C] italic">
          No plate items added yet. Add at least one item above.
        </p>
      ) : (
        <div className="divide-y divide-[#E8DDD1] bg-white border border-[#E8DDD1] rounded-lg">
          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 items-center text-xs"
            >
              <select
                value={item.course}
                onChange={(e) => handleUpdate(item.id, 'course', e.target.value)}
                className="sm:col-span-3 px-2 py-1 border border-[#E8DDD1] rounded bg-white font-medium text-[#702C3A]"
              >
                {PLATE_COURSE_TYPES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={item.itemName}
                onChange={(e) => handleUpdate(item.id, 'itemName', e.target.value)}
                className="sm:col-span-5 px-2 py-1 border border-[#E8DDD1] rounded"
              />
              <input
                type="text"
                value={item.quantity}
                onChange={(e) => handleUpdate(item.id, 'quantity', e.target.value)}
                className="sm:col-span-3 px-2 py-1 border border-[#E8DDD1] rounded"
              />
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="sm:col-span-1 p-1.5 text-[#702C3A] hover:bg-[#FDECEF] rounded justify-self-end"
                aria-label="Remove item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

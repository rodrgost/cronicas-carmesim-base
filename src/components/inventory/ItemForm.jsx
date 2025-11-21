import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ITEM_TYPES = [
  { value: "weapon", label: "Arma" },
  { value: "armor", label: "Armadura" },
  { value: "artifact", label: "Artefato" },
  { value: "document", label: "Documento" },
  { value: "consumable", label: "Consumível" },
  { value: "tool", label: "Ferramenta" },
  { value: "misc", label: "Diversos" }
];

export default function ItemForm({ onSubmit, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    type: initialData?.type || "misc",
    quantity: initialData?.quantity || 1,
    weight: initialData?.weight || 1,
    is_equipped: initialData?.is_equipped || false,
    notes: initialData?.notes || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-gray-400">Nome do Item</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Espada de Prata"
          required
          className="bg-secondary border-border text-foreground"
        />
      </div>

      <div>
        <Label htmlFor="type" className="text-gray-400">Tipo</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger className="bg-secondary border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ITEM_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity" className="text-gray-400">Quantidade</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
            className="bg-secondary border-border text-foreground"
          />
        </div>
        <div>
          <Label htmlFor="weight" className="text-gray-400">Peso (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            min="0"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 1 })}
            className="bg-secondary border-border text-foreground"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-gray-400">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descreva o item..."
          className="bg-secondary border-border text-foreground h-20"
        />
      </div>

      <div>
        <Label htmlFor="notes" className="text-gray-400">Notas</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Suas anotações sobre o item..."
          className="bg-secondary border-border text-foreground h-16"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_equipped"
          checked={formData.is_equipped}
          onCheckedChange={(checked) => setFormData({ ...formData, is_equipped: checked })}
        />
        <Label htmlFor="is_equipped" className="text-gray-400 cursor-pointer">
          Item equipado/em uso
        </Label>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
          {initialData ? "Salvar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}
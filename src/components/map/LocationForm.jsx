import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

const LOCATION_TYPES = [
  { value: "haven", label: "Refúgio" },
  { value: "elysium", label: "Elysium" },
  { value: "feeding_ground", label: "Área de Caça" },
  { value: "landmark", label: "Ponto de Interesse" },
  { value: "danger_zone", label: "Zona de Perigo" },
  { value: "neutral", label: "Neutro" },
  { value: "custom", label: "Personalizado" }
];

export default function LocationForm({ 
  onSubmit, 
  onCancel, 
  initialData = null,
  coordinates 
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    type: initialData?.type || "custom",
    notes: initialData?.notes || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      latitude: coordinates?.lat || initialData?.latitude,
      longitude: coordinates?.lng || initialData?.longitude
    });
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">
          {initialData ? "Editar Local" : "Novo Local"}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-400">Nome do Local</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Elysium da Av. Paulista"
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
                {LOCATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-400">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o local..."
              className="bg-secondary border-border text-foreground h-24"
            />
          </div>

          <div>
            <Label htmlFor="notes" className="text-gray-400">Notas Pessoais</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Suas anotações sobre este local..."
              className="bg-secondary border-border text-foreground h-20"
            />
          </div>

          {coordinates && (
            <div className="text-xs text-gray-400">
              Coordenadas: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              {initialData ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
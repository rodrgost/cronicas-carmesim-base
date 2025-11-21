import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Package, 
  Sword, 
  Shield, 
  Scroll, 
  Pill, 
  Wrench,
  Box,
  Trash2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ItemForm from "./ItemForm";
import { useTranslation } from "@/components/i18n/LanguageContext";

const ITEM_TYPES_CONFIG = {
  weapon: { icon: Sword, color: "text-red-500" },
  armor: { icon: Shield, color: "text-blue-500" },
  artifact: { icon: Box, color: "text-purple-500" },
  document: { icon: Scroll, color: "text-yellow-500" },
  consumable: { icon: Pill, color: "text-green-500" },
  tool: { icon: Wrench, color: "text-gray-500" },
  misc: { icon: Package, color: "text-gray-400" }
};

export default function InventoryPanel({ character, chronicle }) {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (character) {
      loadInventory();
    }
  }, [character]);

  const loadInventory = async () => {
    try {
      setIsLoading(true);
      const allItems = await base44.entities.Item.list();
      const characterItems = allItems.filter(item => item.character_id === character.id);
      setItems(characterItems);
    } catch (error) {
      console.error("Error loading inventory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async (itemData) => {
    try {
      await base44.entities.Item.create({
        ...itemData,
        character_id: character.id,
        chronicle_id: chronicle.id
      });
      await loadInventory();
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleUpdateItem = async (itemData) => {
    try {
      await base44.entities.Item.update(editingItem.id, itemData);
      await loadInventory();
      setEditingItem(null);
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await base44.entities.Item.delete(itemId);
      await loadInventory();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
  const equippedItems = items.filter(item => item.is_equipped);

  return (
    <Card className="bg-card border-border h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          <CardTitle className="text-foreground">{t('inventory.title')}</CardTitle>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-1" />
              {t('inventoryPanel.item')}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border z-[300]">
            <DialogHeader>
              <DialogTitle className="text-foreground">{t('inventory.addItem')}</DialogTitle>
            </DialogHeader>
            <ItemForm 
              onSubmit={handleAddItem}
              onCancel={() => setShowAddForm(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col">
        <div className="flex gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            {t('inventoryPanel.total')}: {items.length} {t('inventoryPanel.items')}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {t('inventoryPanel.weight')}: {totalWeight.toFixed(1)} {t('inventoryPanel.kg')}
          </Badge>
          {equippedItems.length > 0 && (
            <Badge className="bg-green-900 text-xs">
              {t('inventoryPanel.equipped')}: {equippedItems.length}
            </Badge>
          )}
        </div>

        <ScrollArea className="flex-1 pr-4">
          {isLoading ? (
            <p className="text-center text-gray-500 text-sm py-4">{t('inventoryPanel.loading')}</p>
          ) : items.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-4">
              {t('inventoryPanel.empty')}
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => {
                const typeConfig = ITEM_TYPES_CONFIG[item.type] || ITEM_TYPES_CONFIG.misc;
                const IconComponent = typeConfig.icon;
                const typeLabel = t(`inventoryPanel.types.${item.type}`) || t('inventoryPanel.types.misc');
                
                return (
                  <Dialog key={item.id}>
                    <DialogTrigger asChild>
                      <div className="p-3 bg-secondary rounded-lg hover:bg-secondary/80 cursor-pointer transition-colors group">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2 flex-1">
                            <IconComponent className={`w-4 h-4 mt-0.5 ${typeConfig.color}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">
                                  {item.name}
                                </span>
                                {item.is_equipped && (
                                  <Badge variant="outline" className="text-xs bg-green-900/30 border-green-700">
                                    {t('inventoryPanel.equippedBadge')}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {typeLabel}
                                </Badge>
                                {item.quantity > 1 && (
                                  <Badge variant="outline" className="text-xs">
                                    x{item.quantity}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogTrigger>
                    
                    <DialogContent className="bg-card border-border z-[300]">
                      <DialogHeader>
                        <DialogTitle className="text-foreground flex items-center gap-2">
                          <IconComponent className={`w-5 h-5 ${typeConfig.color}`} />
                          {item.name}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">{t('inventoryPanel.description')}</h4>
                          <p className="text-sm text-gray-300">{item.description || t('inventoryPanel.noDescription')}</p>
                        </div>
                        
                        <div className="flex gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">{t('inventoryPanel.type')}:</span>
                            <span className="text-foreground ml-2">{typeLabel}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">{t('inventoryPanel.quantity')}:</span>
                            <span className="text-foreground ml-2">{item.quantity}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">{t('inventoryPanel.weight')}:</span>
                            <span className="text-foreground ml-2">{item.weight} {t('inventoryPanel.kg')}</span>
                          </div>
                        </div>
                        
                        {item.notes && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">{t('inventoryPanel.notes')}</h4>
                            <p className="text-sm text-gray-300">{item.notes}</p>
                          </div>
                        )}
                        
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            onClick={() => setEditingItem(item)}
                            className="flex-1"
                          >
                            {t('inventoryPanel.edit')}
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" className="text-red-400 hover:text-red-300 hover:bg-red-950/30">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-border z-[300]">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-foreground">{t('inventoryPanel.deleteTitle')}</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                  {t('inventoryPanel.deleteDesc', { name: item.name })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-border bg-secondary text-foreground">
                                  {t('common.cancel')}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="bg-red-900 hover:bg-red-800 text-foreground"
                                >
                                  {t('common.delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="bg-card border-border z-[300]">
            <DialogHeader>
              <DialogTitle className="text-foreground">{t('inventoryPanel.editTitle')}</DialogTitle>
            </DialogHeader>
            <ItemForm
              initialData={editingItem}
              onSubmit={handleUpdateItem}
              onCancel={() => setEditingItem(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
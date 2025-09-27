"use client";

import { Badge, Card, CardContent } from "@convoform/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@convoform/ui";
import { Lightbulb } from "lucide-react";
import { motion } from "motion/react";
import type { Template } from "./types";

type TemplateSelectionProps = {
  templates?: Template[];
  isLoading: boolean;
  selectedTemplateId: string | null;
  onTemplateSelect: (template: Template) => void;
};

export function TemplateSelection({
  templates,
  isLoading,
  selectedTemplateId,
  onTemplateSelect,
}: TemplateSelectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-medium">Quick Start Templates</h3>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {isLoading ? (
          <div className="col-span-full text-sm text-muted-foreground">
            Loading templates...
          </div>
        ) : templates && templates.length > 0 ? (
          <>
            {/* Show first 3 templates as cards */}
            {templates.slice(0, 3).map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer transition-all hover:shadow-sm ${
                    selectedTemplateId === template.id
                      ? "ring-2 ring-brand-500 bg-brand-50"
                      : "hover:bg-muted/30"
                  }`}
                  onClick={() => onTemplateSelect(template)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {template.name}
                      </span>
                      {selectedTemplateId === template.id && (
                        <Badge variant="secondary" className="text-xs">
                          Selected
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Show dropdown for remaining templates if there are more than 3 */}
            {templates.length > 3 && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Card className="cursor-pointer transition-all hover:shadow-sm hover:bg-muted/30">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            More Templates
                          </span>
                          <Badge variant="outline" className="text-xs">
                            +{templates.length - 3}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuGroup>
                      {templates.slice(3).map((template) => (
                        <DropdownMenuItem
                          key={template.id}
                          className="cursor-pointer"
                          onClick={() => onTemplateSelect(template)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm">{template.name}</span>
                            {selectedTemplateId === template.id && (
                              <Badge
                                variant="secondary"
                                className="text-xs ml-2"
                              >
                                Selected
                              </Badge>
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            )}
          </>
        ) : (
          <div className="col-span-full text-sm text-muted-foreground">
            No templates available
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import {
  DEFAULT_FORM_LABEL_SETTINGS,
  type FormLabelCategory,
  type FormLabelSettings,
  MAX_FORM_LABEL_CATEGORIES,
  MAX_FORM_LABEL_OPTIONS,
} from "@convoform/db/src/schema/forms/labelSettings";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
  Switch,
  toast,
} from "@convoform/ui";
import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "@/trpc/react";

type Props = {
  formId: string;
};

function createCategoryId() {
  // `crypto.randomUUID` is unavailable in some non-secure self-hosted
  // contexts, so use a simple collision-resistant id instead.
  return `category-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ResponseLabelsSettings({ formId }: Readonly<Props>) {
  const { data: form, isLoading } = api.form.getOne.useQuery({ id: formId });
  const [settings, setSettings] = useState<FormLabelSettings | null>(null);

  useEffect(() => {
    if (form && settings === null) {
      setSettings(form.labelSettings ?? DEFAULT_FORM_LABEL_SETTINGS);
    }
  }, [form, settings]);

  const updateLabelSettings = api.form.updateLabelSettings.useMutation({
    onSuccess: () => {
      toast.success("Response labels saved");
    },
    onError: () => {
      toast.error("Unable to save response labels");
    },
  });

  const currentSettings = settings ?? DEFAULT_FORM_LABEL_SETTINGS;
  const isEnabled = currentSettings.categoriesEnabled;

  const saveSettings = (nextSettings: FormLabelSettings) => {
    const previousSettings = settings;
    setSettings(nextSettings);
    updateLabelSettings.mutate(
      { formId, labelSettings: nextSettings },
      {
        onError: () => {
          setSettings(previousSettings);
        },
      },
    );
  };

  const handleToggle = (checked: boolean) => {
    saveSettings({ ...currentSettings, categoriesEnabled: checked });
  };

  const updateCategory = (
    index: number,
    update: (category: FormLabelCategory) => FormLabelCategory,
  ) => {
    setSettings({
      ...currentSettings,
      categories: currentSettings.categories.map((category, categoryIndex) =>
        categoryIndex === index ? update(category) : category,
      ),
    });
  };

  const addCategory = () => {
    if (currentSettings.categories.length >= MAX_FORM_LABEL_CATEGORIES) {
      return;
    }

    setSettings({
      ...currentSettings,
      categories: [
        ...currentSettings.categories,
        { id: createCategoryId(), name: "", options: ["", ""] },
      ],
    });
  };

  const removeCategory = (index: number) => {
    setSettings({
      ...currentSettings,
      categories: currentSettings.categories.filter(
        (_category, categoryIndex) => categoryIndex !== index,
      ),
    });
  };

  const handleSaveCategories = () => {
    const cleanedCategories = currentSettings.categories.map((category) => ({
      ...category,
      name: category.name.trim(),
      options: category.options.map((option) => option.trim()),
    }));

    const hasInvalidCategory = cleanedCategories.some(
      (category) =>
        !category.name ||
        category.options.length < 2 ||
        category.options.some((option) => !option),
    );

    if (hasInvalidCategory) {
      toast.error("Each category needs a name and at least two options");
      return;
    }

    saveSettings({ ...currentSettings, categories: cleanedCategories });
  };

  if (isLoading || !settings) {
    return (
      <Card>
        <CardHeader>
          <div className="grid space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="grid min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">
                <Label
                  htmlFor="customCategoryLabelsSwitch"
                  className="cursor-pointer text-base font-semibold"
                >
                  Custom response categories
                </Label>
              </CardTitle>
              <Badge variant="secondary">Experimental</Badge>
            </div>
            <CardDescription>
              Label each response with up to three categories, such as Country
              or Budget. Labels are generated when a conversation completes.
            </CardDescription>
          </div>
          <label className="flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-end">
            <Switch
              id="customCategoryLabelsSwitch"
              checked={isEnabled}
              disabled={updateLabelSettings.isPending}
              onCheckedChange={handleToggle}
            />
          </label>
        </div>
      </CardHeader>

      {isEnabled && (
        <CardContent className="space-y-4 pt-0">
          {currentSettings.categories.map((category, index) => (
            <div key={category.id} className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Input
                  value={category.name}
                  maxLength={40}
                  placeholder="Category name, e.g. Country"
                  aria-label={`Category ${index + 1} name`}
                  className="h-11"
                  onChange={(event) =>
                    updateCategory(index, (current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${category.name || "category"}`}
                  onClick={() => removeCategory(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {category.options.map((option, optionIndex) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: options are edited in place
                  <div key={optionIndex} className="flex items-center gap-2">
                    <Input
                      value={option}
                      maxLength={60}
                      placeholder={`Option ${optionIndex + 1}`}
                      aria-label={`${category.name || `Category ${index + 1}`} option ${optionIndex + 1}`}
                      onChange={(event) =>
                        updateCategory(index, (current) => ({
                          ...current,
                          options: current.options.map(
                            (currentOption, currentOptionIndex) =>
                              currentOptionIndex === optionIndex
                                ? event.target.value
                                : currentOption,
                          ),
                        }))
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove option ${optionIndex + 1}`}
                      disabled={category.options.length <= 2}
                      onClick={() =>
                        updateCategory(index, (current) => ({
                          ...current,
                          options: current.options.filter(
                            (_option, currentOptionIndex) =>
                              currentOptionIndex !== optionIndex,
                          ),
                        }))
                      }
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {category.options.length < MAX_FORM_LABEL_OPTIONS && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateCategory(index, (current) => ({
                      ...current,
                      options: [...current.options, ""],
                    }))
                  }
                >
                  <Plus className="mr-2 size-4" />
                  Add option
                </Button>
              )}
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-2">
            {currentSettings.categories.length < MAX_FORM_LABEL_CATEGORIES && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCategory}
              >
                <Plus className="mr-2 size-4" />
                Add category
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              disabled={updateLabelSettings.isPending}
              onClick={handleSaveCategories}
            >
              Save categories
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

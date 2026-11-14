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
  Checkbox,
  Input,
  Label,
  Skeleton,
  Switch,
  toast,
} from "@convoform/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Tag, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import {
  SUGGESTED_AUTO_TAGS,
  autoTagSettingsEqual,
  resolveAutoTagToggle,
  validateAutoTagSettings,
} from "./responseLabelsSettings.utils";

type Props = {
  formId: string;
};

function createTagId() {
  // `crypto.randomUUID` is unavailable in some non-secure self-hosted
  // contexts, so use a simple collision-resistant id instead.
  return `tag-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const SAVE_DEBOUNCE_MS = 800;

const ALWAYS_ADDED_TAGS = [
  { label: "Tone", widthClassName: "w-20" },
  { label: "Sentiment", widthClassName: "w-28" },
  { label: "Lead temperature", widthClassName: "w-[168px]" },
] as const;

export function ResponseLabelsSettings({ formId }: Readonly<Props>) {
  const queryClient = useQueryClient();
  const { data: form, isLoading } = api.form.getOne.useQuery({ id: formId });
  const [draft, setDraft] = useState<FormLabelSettings | null>(null);
  const [persisted, setPersisted] = useState<FormLabelSettings | null>(null);
  const persistedRef = useRef<FormLabelSettings | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressAutoSaveRef = useRef(false);

  useEffect(() => {
    if (form && draft === null) {
      const initial: FormLabelSettings = {
        categoriesEnabled:
          form.labelSettings?.categoriesEnabled ??
          DEFAULT_FORM_LABEL_SETTINGS.categoriesEnabled,
        categories:
          form.labelSettings?.categories ??
          DEFAULT_FORM_LABEL_SETTINGS.categories,
      };
      setDraft(initial);
      setPersisted(initial);
      persistedRef.current = initial;
    }
  }, [form, draft]);

  const updateLabelSettings = api.form.updateLabelSettings.useMutation({
    onSuccess: (_data, variables) => {
      const saved: FormLabelSettings = {
        categoriesEnabled: variables.labelSettings.categoriesEnabled ?? false,
        categories: variables.labelSettings.categories ?? [],
      };
      setPersisted(saved);
      persistedRef.current = saved;
      toast.success("Saved");
      queryClient.invalidateQueries({ queryKey: [["form"]] });
    },
    onError: () => {
      toast.error("Unable to save auto-tags");
      const previous = persistedRef.current;
      if (previous) {
        setDraft(previous);
      }
    },
    onSettled: () => {
      suppressAutoSaveRef.current = false;
    },
  });

  useEffect(() => {
    if (!draft || !persisted || !draft.categoriesEnabled) {
      return;
    }
    if (suppressAutoSaveRef.current) {
      return;
    }
    if (autoTagSettingsEqual(draft, persisted)) {
      return;
    }
    if (!validateAutoTagSettings(draft).valid) {
      return;
    }
    if (updateLabelSettings.isPending) {
      return;
    }

    const timer = setTimeout(() => {
      updateLabelSettings.mutate({ formId, labelSettings: draft });
    }, SAVE_DEBOUNCE_MS);
    saveTimeoutRef.current = timer;

    return () => {
      clearTimeout(timer);
    };
  }, [draft, persisted, formId, updateLabelSettings.isPending]);

  useEffect(
    () => () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    },
    [],
  );

  const clearScheduledSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  };

  const handleToggle = (checked: boolean) => {
    if (!persistedRef.current) {
      return;
    }

    clearScheduledSave();
    suppressAutoSaveRef.current = true;

    // The switch never saves editor drafts. It reuses the last persisted tags,
    // and only seeds suggestions when enabling a form that has none yet.
    const nextSettings = resolveAutoTagToggle({
      checked,
      persisted: persistedRef.current,
      suggestions: SUGGESTED_AUTO_TAGS,
    });

    setDraft(nextSettings);
    updateLabelSettings.mutate({ formId, labelSettings: nextSettings });
  };

  const handleSuggestionToggle = (
    suggestion: FormLabelCategory,
    checked: boolean,
  ) => {
    if (!draft) {
      return;
    }

    if (checked) {
      if (
        draft.categories.some((category) => category.id === suggestion.id) ||
        draft.categories.length >= MAX_FORM_LABEL_CATEGORIES
      ) {
        return;
      }

      setDraft({
        ...draft,
        categories: [
          ...draft.categories,
          { ...suggestion, options: [...suggestion.options] },
        ],
      });
      return;
    }

    setDraft({
      ...draft,
      categories: draft.categories.filter(
        (category) => category.id !== suggestion.id,
      ),
    });
  };

  const addCustomTag = () => {
    if (!draft || draft.categories.length >= MAX_FORM_LABEL_CATEGORIES) {
      return;
    }

    setDraft({
      ...draft,
      categories: [
        ...draft.categories,
        { id: createTagId(), name: "", options: ["", ""] },
      ],
    });
  };

  const removeTag = (tagId: string) => {
    if (!draft) {
      return;
    }

    setDraft({
      ...draft,
      categories: draft.categories.filter((category) => category.id !== tagId),
    });
  };

  const updateTag = (
    tagId: string,
    update: (category: FormLabelCategory) => FormLabelCategory,
  ) => {
    if (!draft) {
      return;
    }

    setDraft({
      ...draft,
      categories: draft.categories.map((category) =>
        category.id === tagId ? update(category) : category,
      ),
    });
  };

  if (isLoading || !draft) {
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

  const isEnabled = draft.categoriesEnabled;
  const validation = validateAutoTagSettings(draft);
  const isAtTagLimit = draft.categories.length >= MAX_FORM_LABEL_CATEGORIES;
  const activeTagIds = new Set(draft.categories.map((category) => category.id));

  return (
    <Card data-testid="auto-tags-settings">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="grid min-w-0 max-w-2xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">
                <Label
                  htmlFor="autoTagsSwitch"
                  className="cursor-pointer text-base font-semibold"
                >
                  Auto-tags
                </Label>
              </CardTitle>
              <Badge variant="secondary">Experimental</Badge>
              {updateLabelSettings.isPending && (
                <span className="text-xs text-muted-foreground">Saving…</span>
              )}
            </div>
            <CardDescription>
              We&apos;ll tag each finished response, for example by country or
              budget, so you can filter and find the right leads faster.
            </CardDescription>
            <div
              role="group"
              aria-labelledby="always-added-tags-label"
              className="flex flex-wrap items-center gap-2"
            >
              <span
                id="always-added-tags-label"
                className="text-sm font-medium text-muted-foreground"
              >
                Always added
              </span>
              {ALWAYS_ADDED_TAGS.map((tag) => (
                <input
                  key={tag.label}
                  disabled
                  readOnly
                  value={tag.label}
                  aria-label={`${tag.label}, always added`}
                  className={cn(
                    "h-8 cursor-not-allowed rounded-md border border-input bg-muted/40 px-2.5 text-sm text-muted-foreground opacity-100",
                    tag.widthClassName,
                  )}
                />
              ))}
            </div>
          </div>
          <label className="flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-end">
            <Switch
              id="autoTagsSwitch"
              checked={isEnabled}
              disabled={updateLabelSettings.isPending}
              onCheckedChange={handleToggle}
            />
          </label>
        </div>
      </CardHeader>

      {isEnabled && (
        <CardContent className="space-y-5 pt-0">
          <div
            className="space-y-2.5"
            role="group"
            aria-labelledby="suggested-tags-heading"
          >
            <h4 id="suggested-tags-heading" className="text-sm font-medium">
              Suggested tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_AUTO_TAGS.map((suggestion) => {
                const active = activeTagIds.has(suggestion.id);
                const activeTag = draft.categories.find(
                  (category) => category.id === suggestion.id,
                );
                const disabled = !active && isAtTagLimit;

                return (
                  <label
                    key={suggestion.id}
                    className={cn(
                      "flex min-h-9 select-none items-center gap-2 rounded-md border px-3 text-sm transition-colors",
                      active
                        ? "border-primary/30 bg-primary/5 text-foreground"
                        : "border-input bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                      disabled &&
                        "cursor-not-allowed border-input bg-card text-muted-foreground opacity-50 hover:bg-card hover:text-muted-foreground",
                      !disabled && "cursor-pointer",
                    )}
                  >
                    <Checkbox
                      checked={active}
                      disabled={disabled}
                      className="size-4 rounded-[5px]"
                      onCheckedChange={(checked) =>
                        handleSuggestionToggle(suggestion, checked === true)
                      }
                    />
                    <span>{activeTag?.name || suggestion.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div
            className="space-y-3"
            role="group"
            aria-labelledby="your-tags-heading"
          >
            <div className="flex items-center gap-2">
              <Tag className="size-4 text-muted-foreground" />
              <h4 id="your-tags-heading" className="text-sm font-medium">
                Your tags
              </h4>
            </div>

            {draft.categories.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-center">
                <Tag className="size-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Pick a tag to start sorting your responses.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/70">
                {draft.categories.map((category) => {
                  const errors = validation.byTagId[category.id];
                  const choicesAtLimit =
                    category.options.length >= MAX_FORM_LABEL_OPTIONS;

                  return (
                    <div
                      key={category.id}
                      className="relative grid gap-3 py-4 pr-10 first:pt-0 last:pb-0 xl:grid-cols-[220px_minmax(0,1fr)] xl:gap-6"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-5 size-9 text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${category.name || "tag"}`}
                        onClick={() => removeTag(category.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor={`tag-name-${category.id}`}
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Tag name
                        </Label>
                        <Input
                          id={`tag-name-${category.id}`}
                          value={category.name}
                          maxLength={40}
                          placeholder="e.g. Country"
                          aria-invalid={Boolean(errors?.name)}
                          aria-describedby={
                            errors?.name
                              ? `tag-name-error-${category.id}`
                              : undefined
                          }
                          className={cn(
                            "h-9 bg-card hover:bg-card focus-visible:bg-card",
                            errors?.name && "border-destructive",
                          )}
                          onChange={(event) =>
                            updateTag(category.id, (current) => ({
                              ...current,
                              name: event.target.value,
                            }))
                          }
                        />
                        <p
                          id={`tag-name-error-${category.id}`}
                          className={cn(
                            "text-xs text-destructive",
                            !errors?.name && "sr-only",
                          )}
                          aria-live="polite"
                        >
                          {errors?.name ?? ""}
                        </p>
                      </div>

                      <div
                        className="space-y-2"
                        role="group"
                        aria-labelledby={`choices-label-${category.id}`}
                        aria-describedby={
                          errors?.choices?.length
                            ? `choices-error-${category.id}`
                            : undefined
                        }
                      >
                        <div className="flex items-baseline gap-2">
                          <p
                            id={`choices-label-${category.id}`}
                            className="text-xs font-medium text-muted-foreground"
                          >
                            Choices
                          </p>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {choicesAtLimit
                              ? `Up to ${MAX_FORM_LABEL_OPTIONS} choices`
                              : `${category.options.length} of ${MAX_FORM_LABEL_OPTIONS}`}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {category.options.map((option, optionIndex) => (
                            <div
                              key={`${category.id}-${optionIndex}`}
                              className="group flex h-9 min-w-[7rem] max-w-full items-center rounded-md border border-input bg-card pl-2.5 pr-0.5 transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1"
                            >
                              <input
                                value={option}
                                maxLength={60}
                                placeholder="e.g. Canada"
                                aria-label={`${category.name || "Tag"} choice ${optionIndex + 1}`}
                                aria-invalid={Boolean(errors?.choices?.length)}
                                aria-describedby={
                                  errors?.choices?.length
                                    ? `choices-error-${category.id}`
                                    : undefined
                                }
                                className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 pr-1 text-sm outline-none [field-sizing:content] max-w-[18rem] placeholder:text-muted-foreground"
                                onChange={(event) =>
                                  updateTag(category.id, (current) => ({
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
                              <button
                                type="button"
                                aria-label={`Remove choice ${option.trim() || optionIndex + 1}`}
                                className="flex size-8 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                onClick={() =>
                                  updateTag(category.id, (current) => ({
                                    ...current,
                                    options: current.options.filter(
                                      (_choice, currentOptionIndex) =>
                                        currentOptionIndex !== optionIndex,
                                    ),
                                  }))
                                }
                              >
                                <X className="size-3.5" />
                              </button>
                            </div>
                          ))}

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 border-dashed text-muted-foreground hover:text-foreground"
                            disabled={choicesAtLimit}
                            onClick={() =>
                              updateTag(category.id, (current) => ({
                                ...current,
                                options: [...current.options, ""],
                              }))
                            }
                          >
                            <Plus className="mr-1.5 size-4" />
                            Add choice
                          </Button>
                        </div>

                        <div
                          id={`choices-error-${category.id}`}
                          className={cn(
                            "space-y-1",
                            !errors?.choices?.length && "sr-only",
                          )}
                          aria-live="polite"
                        >
                          {errors?.choices?.map((error) => (
                            <p key={error} className="text-xs text-destructive">
                              {error}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isAtTagLimit}
              onClick={addCustomTag}
            >
              <Plus className="mr-2 size-4" />
              Create your own tag
            </Button>
            {isAtTagLimit && (
              <span className="text-xs text-muted-foreground">
                Up to {MAX_FORM_LABEL_CATEGORIES} tags
              </span>
            )}
          </div>

          <p className="border-t pt-4 text-sm text-muted-foreground">
            On the Responses page this shows as:{" "}
            <span className="font-medium text-foreground">
              Canada · ₹20–40L · Hot lead
            </span>
          </p>
        </CardContent>
      )}
    </Card>
  );
}

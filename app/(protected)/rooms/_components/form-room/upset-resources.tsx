"use client"

import { useState } from "react"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useListResources } from "@/hooks/resources/use-list-resources"
import type { RoomFormValues } from "@/lib/schemas/rooms"
import { PlusIcon, XIcon } from "lucide-react"
import { useController, useFormContext } from "react-hook-form"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

export function UpsetResources() {
  const anchor = useComboboxAnchor()
  const { data: resources = [], isLoading, isError } = useListResources()
  const { control, setValue } = useFormContext<RoomFormValues>()
  const { field } = useController({ control, name: "resourcesIds" })
  const [newResourceName, setNewResourceName] = useState("")
  const [newResources, setNewResources] = useState<string[]>([])
  const selectedResources = field.value ?? []

  function addResource() {
    const name = newResourceName.trim()
    if (!name) return

    const normalizedName = name.toLowerCase()
    const existingResource = resources.find(
      (resource) => resource.name.trim().toLowerCase() === normalizedName
    )

    if (existingResource) {
      if (!selectedResources.includes(existingResource.id)) {
        field.onChange([...selectedResources, existingResource.id])
      }
      setNewResourceName("")
      return
    }

    if (
      newResources.some((resource) => resource.toLowerCase() === normalizedName)
    ) {
      setNewResourceName("")
      return
    }

    const updatedResources = [...newResources, name.toLowerCase()]
    setNewResources(updatedResources)
    setValue("newResources", updatedResources, { shouldDirty: true })
    setNewResourceName("")
  }

  function removeNewResource(name: string) {
    const updatedResources = newResources.filter(
      (resource) => resource !== name
    )
    setNewResources(updatedResources)
    setValue("newResources", updatedResources, { shouldDirty: true })
  }

  return (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <Field>
          <p className="text-sm text-muted-foreground" role="status">
            Carregando recursos...
          </p>
        </Field>
      ) : isError ? (
        <Field>
          <FieldError>
            Não foi possível carregar os recursos existentes.
          </FieldError>
        </Field>
      ) : (
        resources.length && (
          <Field>
            <FieldLabel htmlFor="resource-search">
              Recursos existentes
            </FieldLabel>
            <Combobox
              multiple
              autoHighlight
              items={resources.map(({ id }) => id)}
              value={selectedResources}
              onValueChange={field.onChange}
              itemToStringLabel={(id) =>
                resources.find((resource) => resource.id === id)?.name ?? id
              }
            >
              <ComboboxChips ref={anchor} className="w-full">
                <ComboboxValue>
                  {(values) => (
                    <>
                      {values.map((id: string) => (
                        <ComboboxChip key={id} className="capitalize">
                          {resources.find((resource) => resource.id === id)
                            ?.name ?? id}
                        </ComboboxChip>
                      ))}
                      <ComboboxChipsInput
                        id="resource-search"
                        aria-label="Buscar recursos existentes"
                        placeholder="Selecione os recursos"
                      />
                    </>
                  )}
                </ComboboxValue>
              </ComboboxChips>
              <ComboboxContent anchor={anchor}>
                <ComboboxEmpty>Nenhum recurso encontrado</ComboboxEmpty>
                <ComboboxList>
                  {(id) => (
                    <ComboboxItem key={id} value={id} className="capitalize">
                      {resources.find((resource) => resource.id === id)?.name ??
                        id}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>
        )
      )}

      <Field>
        <FieldLabel htmlFor="new-resource">Criar recurso</FieldLabel>
        <div className="flex gap-2">
          <InputGroup>
            <InputGroupInput
              id="new-resource"
              value={newResourceName}
              onChange={(event) => setNewResourceName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  addResource()
                }
              }}
              placeholder="Digite o nome do recurso"
              autoComplete="off"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                variant="outline"
                onClick={addResource}
                disabled={!newResourceName.trim()}
                aria-label="Adicionar recurso"
              >
                <PlusIcon />
                Adicionar
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
        <FieldDescription>
          Recursos novos serão cadastrados junto com a sala.
        </FieldDescription>
        {newResources.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Novos recursos">
            {newResources.map((resource) => (
              <li
                key={resource}
                className="inline-flex items-center rounded-md bg-muted px-2 text-sm"
              >
                {resource}
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeNewResource(resource)}
                        aria-label={`Remover recurso ${resource}`}
                      >
                        <XIcon />
                      </Button>
                    }
                  />
                  <TooltipContent>Remover recurso</TooltipContent>
                </Tooltip>
              </li>
            ))}
          </ul>
        )}
      </Field>
    </div>
  )
}

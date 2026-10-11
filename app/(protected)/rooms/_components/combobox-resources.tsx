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
import { useListResources } from "@/hooks/resources/use-list-resources"
import { ComboboxRoot } from "@base-ui/react"

interface ComboboxResourcesProps {
  selectedResourceIds: string[]
  onValueChange:
    | ((value: string[], eventDetails: ComboboxRoot.ChangeEventDetails) => void)
    | undefined
}
export function ComboboxResources({
  selectedResourceIds,
  onValueChange,
}: ComboboxResourcesProps) {
  const anchor = useComboboxAnchor()
  const { data: resources = [] } = useListResources()

  return (
    <Combobox
      multiple
      autoHighlight
      items={resources.map(({ id }) => id)}
      value={selectedResourceIds}
      onValueChange={onValueChange}
    >
      <ComboboxChips ref={anchor} className="w-full max-w-50">
        <ComboboxValue>
          {(values) => (
            <>
              {values.map((id: string) => (
                <ComboboxChip key={id}>
                  {resources.find((resource) => resource.id === id)?.name ?? id}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput placeholder="Busque por recursos" />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>Não encontrado</ComboboxEmpty>
        <ComboboxList>
          {(id) => (
            <ComboboxItem key={id} value={id}>
              {resources.find((resource) => resource.id === id)?.name ?? id}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}





export type FiltersState = {
campusId?: string;
category?: string;
type?: string;
};


type Props = {
campusOptions: FilterOption[];
categoryOptions: FilterOption[];
typeOptions: FilterOption[];
value: FiltersState;
onChange: (v: FiltersState) => void;
};


function Combo({ options, placeholder, value, onChange }: { options: FilterOption[]; placeholder: string; value?: string; onChange: (v?: string) => void }) {
const [open, setOpen] = React.useState(false);
const selectedLabel = options.find((o) => o.value === value)?.label ?? "All";


return (
<Popover open={open} onOpenChange={setOpen}>
<PopoverTrigger asChild>
<Button variant="outline" role="combobox" aria-expanded={open} className="w-48 justify-between">
{selectedLabel}
<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
</Button>
</PopoverTrigger>
<PopoverContent className="w-48 p-0">
<Command>
<CommandInput placeholder={placeholder} />
<CommandEmpty>No results.</CommandEmpty>
<CommandGroup>
<CommandItem onSelect={() => { onChange(undefined); setOpen(false); }}>
<Check className={cn("mr-2 h-4 w-4", !value ? "opacity-100" : "opacity-0")} />
All
</CommandItem>
{options.map((o) => (
<CommandItem key={o.value} onSelect={() => { onChange(o.value); setOpen(false); }}>
<Check className={cn("mr-2 h-4 w-4", value === o.value ? "opacity-100" : "opacity-0")} />
{o.label}
</CommandItem>
))}
</CommandGroup>
</Command>
</PopoverContent>
</Popover>
);
}


export function Filters({ campusOptions, categoryOptions, typeOptions, value, onChange }: Props) {
return (
<div className="flex flex-wrap gap-2">
<Combo options={campusOptions} placeholder="Search campus" value={value.campusId} onChange={(v) => onChange({ ...value, campusId: v })} />
<Combo options={categoryOptions} placeholder="Search category" value={value.category} onChange={(v) => onChange({ ...value, category: v })} />
<Combo options={typeOptions} placeholder="Search type" value={value.type} onChange={(v) => onChange({ ...value, type: v })} />
</div>
);
}

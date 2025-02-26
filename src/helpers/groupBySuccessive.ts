type GroupResult<T> = NestedGroup<T> | Array<T>;

type NestedGroup<T> = {
    [key: string]: GroupResult<T>
};

function getNestedValue(obj: any, keyPath: string): any {
const keys = keyPath.split('.');
let value = obj;
for (const key of keys) {
    if (value == null) {
    return undefined;
    }
    value = value[key];
}
return value;
}


export function groupBySuccessive<T>(array: T[], keys: string[]): GroupResult<T> {
// Si aucune clé n'est fournie, on retourne le tableau initial (T[])
if (keys.length === 0) {
    return array;
}

// On extrait la première clé et les clés restantes
const [firstKey, ...restKeys] = keys;

// On groupe les éléments par la première clé
const grouped = array.reduce((acc, item) => {
    const keyValue = getNestedValue(item, firstKey);
    if (keyValue !== undefined && keyValue !== null) {
    const keyStr = String(keyValue);
    // Si la clé n'existe pas encore dans acc, on l'initialise comme un tableau vide (T[])
    if (!acc[keyStr]) {
        acc[keyStr] = [];
    }
    // Puisqu'acc[keyStr] est typé comme GroupResult<T>, mais ici c'est un T[],
    // on utilise une assertion de type pour ajouter l'élément
    (acc[keyStr] as T[]).push(item);
    }
    return acc;
}, {} as Record<string, GroupResult<T>>);

// Pour chaque groupe, on applique récursivement le regroupement avec les clés restantes
for (const key in grouped) {
    // grouped[key] est typé comme GroupResult<T>, mais initialement c'est un T[]
    // On appelle récursivement groupBySuccessive, qui retourne un GroupResult<T>
    grouped[key] = groupBySuccessive((grouped[key] as T[]), restKeys);
}

// On retourne le résultat, qui est compatible avec NestedGroup<T>
return grouped;
}

type EqFilter = Array<string|null|[keyPath: string, value: string | null]>

export function successiveFilterByValues<T>(groupResult: GroupResult<T>, equalsToFilters: EqFilter) {
    let result = groupResult;

    //
    for (const filter of equalsToFilters) {
        const [keyPathFilter, valueFilter] = Array.isArray(filter) ? filter : [, filter]

        // if the current filter is null
        if (valueFilter == null) {
            return result
        }

        //
        if (Array.isArray(result)) {
            return keyPathFilter ?
                result.filter(e => getNestedValue(e, keyPathFilter) === valueFilter) :
                result
        }

        // @ts-ignore
        result = result[valueFilter] as GroupResult<T>
    }
    return result;
}
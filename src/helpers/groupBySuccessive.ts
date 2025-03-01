import type { FilterGroupingItem, Grouping } from "./legalstamp.groupedBy";

export type GroupResult<T> = NestedGroup<T> | Array<T>;

type NestedGroup<T> = {
    [key: string]: GroupResult<T>
};

export function getNestedValue<T extends Record<string, unknown>, R = string>(
    obj: T,
    keyPath: string
  ): R | null {
    const keys = keyPath.split('.');
    let value: unknown = obj;
    
    for (const key of keys) {
      if (value == null) {
        return null;
      }
      
      if (typeof value === 'object' && value !== null) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return null;
      }
    }
    
    if (typeof value !== "string") {
      
    }
    return value as R;
  }


type AllGroupResult<T> = {
    /** */
    data: GroupResult<T>,
    /** Grouping used for this output */
    grouping: Grouping
}

export function groupBySuccessive<T extends Record<string, unknown>>(array: T[], grouping: Grouping): AllGroupResult<T> {
    return {
        data: _groupBySuccessive(array, grouping),
        grouping
    }
}

function _groupBySuccessive<T extends Record<string, unknown>>(
  array: T[], 
  keys: Grouping | string[]
): GroupResult<T> {
  // Si aucune clé n'est fournie, on retourne le tableau initial (T[])
  if (keys.length === 0) {
    return array;
  }

  // On extrait la première clé et les clés restantes
  const [firstKey, ...restKeys] = keys;

  // On groupe les éléments par la première clé
  const grouped = array.reduce<Record<string, GroupResult<T>>>((acc, item) => {
    const keyValue = getNestedValue<T, unknown>(item, firstKey);
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
  }, {});

  // Pour chaque groupe, on applique récursivement le regroupement avec les clés restantes
  for (const key in grouped) {
    // grouped[key] est typé comme GroupResult<T>, mais initialement c'est un T[]
    // On appelle récursivement groupBySuccessive, qui retourne un GroupResult<T>
    grouped[key] = _groupBySuccessive((grouped[key] as T[]), restKeys);
  }

  // On retourne le résultat, qui est compatible avec NestedGroup<T>
  return grouped;
}

type EqFilter = Array<string|null|[keyPath: FilterGroupingItem, value: string | null]>

export function successiveFilterByValues<T extends Record<string, unknown>>(groupResult: GroupResult<T>, equalsToFilters: EqFilter) {
    let result = groupResult;

    //
    for (const filter of equalsToFilters) {
        const [keyPathFilter, valueFilter] = Array.isArray(filter) ? filter : [, filter]

        //
        if (valueFilter == null) {
            continue;
        }

        //
        if (Array.isArray(result) && keyPathFilter) {
            result = result.filter(e => getNestedValue(e, keyPathFilter) === valueFilter) 
        } 
        
        if (keyPathFilter == undefined && !Array.isArray(result)) {
            result = result[valueFilter] as GroupResult<T>
        }
    }

    //
    return result;
}
import type { ClassConstructor } from "class-transformer";
import { db } from "../../main";
import { Result } from "../helper/result";
import { BaseEntity, newEntity } from "@indexeddb-orm/idb-orm";
import type { IPagination } from "../model/pagination";
import MiniSearch from 'minisearch';

export abstract class CrudIndexedDbRepository<M extends BaseEntity> {
    db = db;
    abstract entity: ClassConstructor<M>;


    addModel = async (model: M) => {
        const n = newEntity(this.entity, model);
        await this.db.getRepository(this.entity).add(JSON.parse(JSON.stringify(n)));
    }

    getPage = async (page = 1): Promise<Result<string, IPagination<M>>> => {
        try {
            const pageSize = 25;
            const repo = this.db.getRepository(this.entity);

            const [allItems, data] = await Promise.all([
                (await repo.toArray()),
                repo.offset((page - 1) * pageSize).limit(pageSize).toArray() as Promise<M[]>,
            ]);

            const totalCount = allItems.length;
            const totalPages = Math.ceil(totalCount / pageSize);

            return Result.ok({
                data,
                totalCount,
                totalPages,
                currentPage: page,
            });
        } catch (error) {
            return Result.error('');
        }

    }
    edit = async (model: M): Promise<Result<string, void>> => {
        try {
            await this.db.getRepository(this.entity).where('id').equals(model.id ?? 1).modify(JSON.parse(JSON.stringify(model)));
            return Result.ok(undefined);
        } catch (error) {
            return Result.error('');
        }
    }


    deleteModel = async (id: number) => {
        try {
            return Result.ok(await this.db.getRepository(this.entity).where('id').equals(id).delete());
        }
        catch (e) {
            return Result.error("");
        }
    }


    findModel = async (prop: string, value: string, isNeedSimple: boolean = false) => {
        if (prop === 'id') {
            return Result.ok(await this.db.getRepository(this.entity).where(prop).equals(value).toArray());

        }
        if (isNeedSimple) {
            return Result.ok(await this.db.getRepository(this.entity).where(prop).equals(value).toArray());

        }
        const documents = await (await this.db.getRepository(this.entity).toArray())
        const f = documents.map((el) => {
            // @ts-ignore
            return { prop: el[prop], id: el.id }
        })
        const allFields = Object.keys(f[0]);
        const miniSearch = new MiniSearch<M>({
            fields: allFields.filter(key => key !== prop),
            storeFields: allFields,
            searchOptions: {
                fuzzy: 1,
                prefix: true
            }
        });

        miniSearch.addAll(f as any);
        // this.miniSearch.search(value)
        const searchResults = miniSearch.search(value);

        return Result.ok(documents.filter(doc => new Set(searchResults.map(result => result.id)).has((doc as any).id)));

    }
}




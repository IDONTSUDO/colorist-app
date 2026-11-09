import type { ClassConstructor } from "class-transformer";
import { db } from "../../main";
import { Result } from "../helper/result";
import { BaseEntity, newEntity } from "@indexeddb-orm/idb-orm";
import type { IPagination } from "../model/pagination";
import MiniSearch from 'minisearch';

export abstract class CrudIndexedDbRepository<M extends BaseEntity> {
    db = db;
    abstract entity: ClassConstructor<M>;

    // Сообщение при нарушении уникального индекса (ConstraintError из IndexedDB).
    // Наследники переопределяют, чтобы показать понятный текст для своих полей.
    uniqueErrorMessage = async (field: string, _model: M): Promise<string> =>
        `Запись с таким значением поля «${field}» уже существует`;

    protected errorMessage = async (error: unknown, model: M): Promise<string> => {
        const e = error as { name?: string; message?: string; inner?: { name?: string; message?: string } };
        const text = `${e?.message ?? ""} ${e?.inner?.message ?? ""}`;
        const isConstraint =
            e?.name === "ConstraintError" || e?.inner?.name === "ConstraintError" || /ConstraintError/.test(text);
        if (isConstraint) {
            const field = text.match(/index '([^']+)'/)?.[1];
            if (field !== undefined) return this.uniqueErrorMessage(field, model);
            return "Такая запись уже существует";
        }
        return e?.message || "Не удалось сохранить запись";
    };


    addModel = async (model: M) => {
        try {
            const n = newEntity(this.entity, model);
            await this.db.getRepository(this.entity).add(JSON.parse(JSON.stringify(n)));
            return Result.ok();
        } catch (error) {
            return Result.error(await this.errorMessage(error, model));
        }
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
            return Result.error(await this.errorMessage(error, model));
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


    findModel = async (prop: string, value: string, isNeedSimple: boolean = false, isNeedIndex = false) => {
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
        let searchResults = miniSearch.search(value);
        if (isNeedIndex) {
            searchResults = searchResults.filter((el) => el.score > 1)
        }
        return Result.ok(documents.filter(doc => new Set(searchResults.map(result => result.id)).has((doc as any).id)));

    }
}




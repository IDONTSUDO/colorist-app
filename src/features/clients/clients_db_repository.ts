import type { ClassConstructor } from "class-transformer";
import { CrudIndexedDbRepository } from "../../core/repository/indexed_db_repository";
import { ClientViewModel } from "./clients_db_model";
import MiniSearch from "minisearch";
import { Result } from "../../core/helper/result";

export class ClientsDbRepository extends CrudIndexedDbRepository<ClientViewModel> {
    entity: ClassConstructor<ClientViewModel> = ClientViewModel;

    uniqueErrorMessage = async (field: string, model: ClientViewModel): Promise<string> => {
        if (field !== "numberPhone") return `Запись с таким значением поля «${field}» уже существует`;
        const phone = `+7 (${String(model.numberPhone ?? "").replace(" ", ") ")}`;
        const owner = await this.db
            .getRepository(this.entity)
            .where("numberPhone")
            .equals(model.numberPhone)
            .first()
            .catch(() => undefined);
        const name = owner
            ? [owner.family, owner.name, owner.surName].filter(Boolean).join(" ")
            : "";
        return name
            ? `Клиент с номером ${phone} уже есть: ${name}`
            : `Клиент с номером ${phone} уже есть`;
    };
    findInFio = async (value: string) => {
        const documents = await (await this.db.getRepository(this.entity).toArray())

        const allFields = Object.keys(documents[0]);
        const miniSearch = new MiniSearch<ClientViewModel>({
            fields: allFields,
            storeFields: allFields,
            searchOptions: {
                fuzzy: 1,
                prefix: true
            }
        });

        miniSearch.addAll(documents as any);
        const searchResults = miniSearch.search(value);

        return Result.ok(documents.filter(doc => new Set(searchResults.map(result => result.id)).has((doc as any).id)));
    }
    // Телефон хранится как "999 123-45-67" (без +7) — сравниваем только цифры
    findByPhoneDigits = async (digits: string): Promise<ClientViewModel[]> => {
        const normalize = (phone: unknown) => {
            const d = String(phone ?? "").replace(/\D/g, "");
            return d.length === 11 && /^[78]/.test(d) ? d.slice(1) : d;
        };
        return this.db
            .getRepository(this.entity)
            .filter((c: ClientViewModel) => normalize(c.numberPhone).includes(digits))
            .toArray();
    }
}
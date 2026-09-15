import type { ClassConstructor } from "class-transformer";
import { CrudIndexedDbRepository } from "../../core/repository/indexed_db_repository";
import { ClientViewModel } from "./clients_db_model";
import MiniSearch from "minisearch";
import { Result } from "../../core/helper/result";

export class ClientsDbRepository extends CrudIndexedDbRepository<ClientViewModel> {
    entity: ClassConstructor<ClientViewModel> = ClientViewModel;
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
}
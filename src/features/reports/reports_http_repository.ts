import { CrudHttpRepository } from "../../core/repository/http_repository";
import { ReportsViewModel } from "./reports_store";

export class ReportsHttpRepository extends CrudHttpRepository<ReportsViewModel> {
  featurePath: string = "/reports";
}

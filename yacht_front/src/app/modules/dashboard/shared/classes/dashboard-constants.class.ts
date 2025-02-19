import { IActivityView } from '@api/schemas/dashboard/activity-view.interface';
import { IStatTags } from '../../pages/tags-management-page/components/statistic-tags-block/stat-tags.interface';
import { ISelectItem } from '../ui/dashboard-select/select-item.interface';
import { IRangeParams } from '../ui/dashboard-range/range-params.interface';

export class DashboardConstants {
  public static SelectItemConstant: ISelectItem = {
    title: null,
    id: null,
    payload: null,
  };

  public static RangeParamsConstant: IRangeParams = {
    before: null,
    after: null,
    checkbox: null,
  };

  public static TagsStatConstant: IStatTags = {
    all: null,
    new: null,
  };

  public static ActivityConstant: IActivityView = {
    count: {
      all: null,
      users: null,
      companies: null,
    },
    registrations: {
      all: null,
      users: null,
      companies: null,
    },
    presence: {
      all: null,
      users: null,
      companies: null,
    },
    activity: {
      all: null,
      users: null,
      companies: null,
    },
    materials: {
      all: {
        articles: null,
        comments: null,
        news: null,
      },
      users: {
        articles: null,
        comments: null,
        news: null,
      },
      companies: {
        articles: null,
        comments: null,
        news: null,
      },
    },
  };
}

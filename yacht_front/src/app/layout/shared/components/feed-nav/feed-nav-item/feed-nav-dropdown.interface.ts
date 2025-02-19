export interface IFeedNavDropdown {
    hasDropdown: boolean;
    items?: IFeedNavDropdownItem[];
}

interface IFeedNavDropdownItem {
    link: string | string[];
    query?: any;
    text: string;
}

import { IFeedNavDropdown } from './feed-nav-item/feed-nav-dropdown.interface';

interface IFeedDropdownConstant {
    popularDropdownConf: IFeedNavDropdown;
    personalDropdownConf: IFeedNavDropdown;
}

export const feedDropdownConstant: IFeedDropdownConstant = {
    personalDropdownConf: {
        hasDropdown: true,
        items: [
            {
                text: 'COMMON.MY_AUTHORS',
                link: ['/'],
                query: {
                    sub: 'author',
                    company: false
                }
            },
            {
                text: 'COMMON.MY_COMPANIES',
                link: ['/'],
                query: {
                    sub: 'author',
                    company: true
                }
            },
            {
                text: 'COMMON.MY_TOPICS',
                link: ['/'],
                query: {
                    sub: 'topic',
                    company: null
                }
            },
        ]
    },
    popularDropdownConf: {
        hasDropdown: true,
        items: [
            {
                text: 'COMMON.FOR_THE_DAY',
                link: ['/popular/day'],
            },
            {
                text: 'COMMON.FOR_3_DAYS',
                link: ['/popular/three-days'],
            },
            {
                text: 'COMMON.FOR_THE_WEEK',
                link: ['/popular/week'],
            },
            {
                text: 'COMMON.FOR_THE_MONTH',
                link: ['/popular/month'],
            },
            {
                text: 'COMMON.FOR_THE_YEAR',
                link: ['/popular/year'],
            },
            {
                text: 'COMMON.FOR_THE_WHOLE_TIME',
                link: ['/popular/all-time'],
            },
            {
                text: 'COMMON.YACHTSMAN_CHOICE',
                link: ['/popular/editorschoice'],
            },
        ]
    }
};

class SelectFilter {
    templateButton = `<button
                        type="button"
                        class="dropdown-button"
                    >
                        <svg class="dropdown-button__icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.5 13C10.5376 13 13 10.5376 13 7.5C13 4.46243 10.5376 2 7.5 2C4.46243 2 2 4.46243 2 7.5C2 10.5376 4.46243 13 7.5 13Z" stroke="currentColor" stroke-width="2" stroke-linecap="square"/>
                            <path d="M12 12L14 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span class="dropdown-button__title fw-semibold">#textButton#</span>
                        <span class="dropdown-button__count"></span>
                    </button>
                    <div class="dropdown-content" data-entity="dropdown"></div>
    `;
    currentTab = null;
    currentTabContent = null;
    collectionTabs = null;
    selected = new Map();

    constructor({
        selectRootNode,
        optoins,
        tabs
    }) {
        this.rootNode = document.querySelector(selectRootNode);
        this.optoins = optoins;
        this.tabs = tabs;

        if (this.rootNode) {
            this.render();
        }
    }

    render() {
        this.insertButton();
        this.dropdownButton = this.rootNode.querySelector('.dropdown-button');
        this.countSelectedNode = this.rootNode.querySelector('.dropdown-button__count');

        this.initEventToggleButton();

        if (Array.isArray(this.tabs) && this.tabs.length > 0) {
            this.insertList();

            this.currentTab = this.rootNode.querySelector('.tabs-nav .nav-link.active');
            this.wrapperTabs = this.rootNode.querySelector('.tab-content');
            this.currentContentTab = this.rootNode.querySelector('.tab-content > .tab-wrapper.active');
            this.wrapperSelectedNode = this.rootNode.querySelector('.dropdowm-selected__inner');
            this.rootNode.addEventListener('click', (event) => {
                this.initEventTab(event);
                this.initEventSelect(event);
                this.initEventCloseSelected(event);
            });

            this.eventScrollBottomShadow();
        }
    }

    insertButton() {
        this.rootNode.insertAdjacentHTML('afterbegin', this.templateButton.replace('#textButton#', this.optoins.textButton));
    }

    insertList() {
        let listTemplate = '';
        let tabTemplate = '';
        let contentTabsTemplate = '';
        listTemplate += `<div class="select-dropdown">
                            <div class="select-dropdown__inner">
                                <ul class="tabs-nav">`;

        this.tabs.forEach((tab, i) => {
            tabTemplate += `<li class="nav-item">
                                <a href="#tab-index-${i}" class="nav-link fw-semibold ${i === 0 ? 'active' : ''}">
                                    ${tab.name}
                                </a>
                            </li>`;
            contentTabsTemplate += `<div class="tab-wrapper ${i === 0 ? 'active' : ''}" data-tab="#tab-index-${i}">
                                        <ul class="dropdown-list">`;

            tab.items.forEach((item, j) => {
                contentTabsTemplate += `<li class="dropdown-item">
                                            <label class="dropdowm-label" for="di-${i}-${j}">
                                                <span class="dropdowm-label__name">${item.name}</span>
                                                <input type="checkbox" class="dropdown-checkbox" data-tab-index="${i}" data-item-index="${j}" id="di-${i}-${j}" value="${item.name}"/>
                                            </label>
                                        </li>`;
            });

            contentTabsTemplate += `</ul></div>`;
        });

        listTemplate += tabTemplate;
        listTemplate += `</ul>`;
        listTemplate += `<div class="dropdown-selected">
                            <div class="dropdowm-selected__inner"></div>
                        </div>`;
        listTemplate += `<div class="tab-content">`;
        listTemplate += contentTabsTemplate;
        listTemplate += `</div></div>`;

        this.rootNode.querySelector('[data-entity="dropdown"]').insertAdjacentHTML('beforeend', listTemplate);
    }

    initEventToggleButton() {
        this.dropdownButton.addEventListener('click', (event) => {
            event.target.closest('button').classList.toggle('active');
            this.rootNode.querySelector('.select-dropdown').classList.toggle('active');
            this.showOrHideBottomShadow();
        })
    }

    initEventTab(event) {
        if (!event.target.closest('.tabs-nav .nav-link')) return;

        const linkTab = event.target.closest('.tabs-nav .nav-link');
        const contentTab = this.rootNode.querySelector(`[data-tab="${event.target.getAttribute('href')}"]`);

        if (this.currentTab != linkTab && contentTab) {
            this.currentTab.classList.remove('active');
            linkTab.classList.add('active');

            this.currentContentTab.classList.remove('active');
            contentTab.classList.add('active');

            this.currentTab = linkTab;
            this.currentContentTab = contentTab;
        }

        this.showOrHideBottomShadow();
    }

    initEventSelect(event) {
        const currentCheckbox = event.target.closest('.dropdown-checkbox')
        if (currentCheckbox) {
            const tabIndex = currentCheckbox.dataset.tabIndex;
            const itemIndex = currentCheckbox.dataset.itemIndex;
            if (currentCheckbox.checked) {
                this.selected.set(tabIndex + '-' + itemIndex, '');
                this.insertSelectedNode(tabIndex, itemIndex);
            } else {
                this.selected.delete(tabIndex + '-' + itemIndex);
                this.deleteSelectedNode(tabIndex, itemIndex);
            }

            this.changeCountSelected();
            this.showOrHideBottomShadow();
        }
    }

    initEventCloseSelected(event) {
        const closeButton = event.target.closest('[data-entity="delete-selected"]');
        if (closeButton) {
            const tabIndex = closeButton.dataset.tabIndex;
            const itemIndex = closeButton.dataset.itemIndex;

            this.selected.delete(tabIndex + '-' + itemIndex);
            this.deleteSelectedNode(tabIndex, itemIndex);
            this.rootNode.querySelector(`#di-${tabIndex}-${itemIndex}`).checked = false;
            this.changeCountSelected();
            this.showOrHideBottomShadow();
        }
    }

    insertSelectedNode(tabIndex, itemIndex) {
        const templateSelect = `<div class="dropdown-selected__item" data-id="${tabIndex}-${itemIndex}">
                                    <span class="dropdown-selected__name fw-semibold">
                                        ${this.tabs[tabIndex].items[itemIndex].name}
                                    </span>
                                    <i class="icon-close" data-entity="delete-selected" data-tab-index="${tabIndex}" data-item-index="${itemIndex}">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M3.91235 4L11.9128 12.0004M12.0843 4L4.08392 12.0004" stroke="currentColor" stroke-opacity="0.4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>                                      
                                    </i>
                                </div>`;

        this.wrapperSelectedNode.insertAdjacentHTML('beforeend', templateSelect);
    }

    deleteSelectedNode(tabIndex, itemIndex) {
        this.wrapperSelectedNode.querySelector(`[data-id="${tabIndex}-${itemIndex}"]`).remove();
    }

    changeCountSelected() {
        if (this.selected.size > 0) {
            this.countSelectedNode.innerText = this.selected.size;
            this.countSelectedNode.classList.add('active');
        } else {
            this.countSelectedNode.innerText = '';
            this.countSelectedNode.classList.remove('active');
        }
    }

    eventScrollBottomShadow() {
        this.wrapperTabs.addEventListener('scroll', function (event) {
            if (this.wrapperTabs.scrollHeight > this.wrapperTabs.clientHeight + event.target.scrollTop + 10) {
                this.wrapperTabs.classList.add('shadow-bottom');
            } else {
                this.wrapperTabs.classList.remove('shadow-bottom');
            }
        }.bind(this));
    }

    showOrHideBottomShadow() {
        if (this.checkScrollTabContent()) {
            this.wrapperTabs.classList.add('shadow-bottom');
        } else {
            this.wrapperTabs.classList.remove('shadow-bottom');
        }
    }

    checkScrollTabContent() {
        return this.wrapperSelectedNode.offsetHeight;
    }
}


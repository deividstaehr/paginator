class Table {

    constructor() {
        this._target = null;
        this._name = null;
        this._data = [];
        this._route = null;
        this._fields = [];
        this._actions = [];
        this._total = 0;
        this._page = 1;
        this._limit = 50;
        this._id = '_' + Math.random().toString(36).substr(2, 9);
        this._key = null;
        this._selectedRows = [];
    }

    getClient() {
        return 'gdoky';
    }

    addField(field) {
        this._fields.push(field);
    }

    addAction(action) {
        this._actions.push({ ...action, id: `${this.id}-act-${action.name}` });
    }

    async boot() {
        const res = await api.get(this.route);
        const { data, total } = res.data;

        this.data = data;

        this.total = total;

        this.dressingTable();
    }

    dressingTable() {

    }

    getFilterOptions() {
        return this.fields.reduce((accumulator, currentValue) =>
            accumulator + `<option value=${currentValue.name}>${currentValue.title}</option>`, ''
        );
    }

    getHeaders() {
        return this.fields.reduce((accumulator, field) => (accumulator + `
            <div style="width: ${field.width}%">${field.title}</div>
        `), '');
    }

    makeSkeleton() {
        const searchButtonId = this.id + '-search-button';
        const totalId = this.id + '-total-counter';

        fillById(this.target, `
            <div class="data-table-filter">
                <div>
                    <button id="${searchButtonId}">Consultar</button>
                </div>
            </div>

            <div class="actions-container">
                ${this.getActions()}
            </div>

            <div class="data-table-header">
                ${this.getHeaders()}
            </div>
            <div class="data-table-content" id="${this.id}">
                <div id="not-search">Nenhuma busca realizada</div>
            </div>
            <div class="data-table-footer">
                <span id="${totalId}">0</span> registro(s) encontrado(s)
            </div>
        `);

        // setando a altura
        byId(this.id).style.overflow = 'overlay';
        byId(this.id).style.maxHeight = `${byId(this.id).offsetHeight}px`;

        this.notifyActions();
        
        addEventById(searchButtonId, 'click', () => this.load());
    }

    async load() {
        loadingStart();
        
        try {
            const res = await api.get(`${this.route}/index?__c=${this.getClient()}`);
            const { data, current_page, total } = res.data;

            this.data = data;

            this.fillDataTable(data);

            Array.from(
                document.querySelectorAll(`#${this.id} .data-table-row`)
            ).forEach(item => (
                item.addEventListener('click', () => this.onClickRow(item))
            ));

            const totalId = this.id + '-total-counter';

            fillById(totalId, total);
        } catch(e) {
            loadAlert('Erro na requisição');
        }

        loadingDestroy();
    }

    getActions() {
        return this.actions.reduce((accumulator, { id, title }) => (accumulator + `
            <button id="${id}">${title}</button>
        `), '');
    }

    notifyActions() {
        this.actions.forEach(action => {
            recreateElement(
                byId(action.id)
            );

            if (action.onValidate(this)) {
                byId(action.id).classList.remove('btn-disabled');

                addEventById(action.id, 'click', () => action.onClick(this, action));
            } else {
                byId(action.id).classList.add('btn-disabled');
            }
        });
    }

    onClickRow(row) {
        const classSelected = 'row-selected';
        const classList = Array.from(row.classList);

        if (classList.indexOf(classSelected) >= 0) {
            row.classList.remove('row-selected');
        } else {
            byClass('row-selected').forEach(cls =>
                cls.classList.remove('row-selected')
            );

            row.classList.add('row-selected');
        }

        this.resetSelectedRow();

        byClass(classSelected).forEach(el => this.addSelectedRow(
            el.getAttribute('key')
        ));

        this.notifyActions();
    }

    fillDataTable(data) {
        fillById(
            this.id,
            data.reduce((accumulator, currentValue) => (
                accumulator + this.generateRow(currentValue)
            ), '')
        );
    }

    getSelectedRows() {
        return this.selectedRows;
    }

    resetSelectedRow() {
        this.selectedRows = [];
    }

    addSelectedRow(selectedRow) {
        this.selectedRows.push(selectedRow);
    }

    removeSelectedRow(selectedRow) {
        this.selectedRows.splice(
            this.selectedRows.indexOf(selectedRow), 1
        );
    }

    getCountSelectedRows() {
        return this.selectedRows.length;
    }

    generateRow(row) {
        let rowKey = {};

        this.key.forEach(k => {
            rowKey[k] = row[k];
        });

        const grid = this.fields.reduce((accumulator, field) => (accumulator + `
            <div style="width: ${field.width}%" class="data-table-item scrollbar">
                ${row[field.name] || ''}
            </div>
        `), '');

        return `<div key="${btoa(JSON.stringify(rowKey))}" class="data-table-row">
            ${grid}
        </div>`;
    }

    render() {
        if (!this.target) return;

        this.makeSkeleton();

        //this.boot();
    }

    set name(t) {
        this._name = t;
    }

    get name() {
        return this._name;
    }

    set target(t) {
        this._target = t;
    }

    get target() {
        return this._target;
    }

    set route(t) {
        this._route = t;
    }

    get route() {
        return this._route;
    }

    set data(t) {
        this._data = t;
    }

    get data() {
        return this._data;
    }

    set total(t) {
        this._total = t;
    }

    get total() {
        return this._total;
    }

    set page(t) {
        this._page = t;
    }

    get page() {
        return this._page;
    }

    set limit(t) {
        this._limit = t;
    }

    get limit() {
        return this._limit;
    }

    set fields(t) {
        this._fields = t;
    }

    get fields() {
        return this._fields;
    }

    set actions(t) {
        this._actions = t;
    }

    get actions() {
        return this._actions;
    }

    set id(t) {
        this._id = t;
    }

    get id() {
        return this._id;
    }

    set key(t) {
        this._key = t;
    }

    get key() {
        return this._key;
    }

    set selectedRows(t) {
        this._selectedRows = t;
    }

    get selectedRows() {
        return this._selectedRows;
    }

}

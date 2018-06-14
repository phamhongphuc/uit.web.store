export default {
    /**
     * @param {typeof import("../state").default} state
     */
    load_books(state, books) {
        state.data.books = books;
    },

    /**
     * @param {typeof import("../state").default} state
     */
    load_employees(state, employees) {
        state.data.employees = employees;
    },

    /**
     * @param {typeof import("../state").default} state
     */
    load_users(state, users) {
        state.data.users = users;
    },

    /**
     * @param {typeof import("../state").default} state
     */
    load_suppliers(state, supplier) {
        state.data.suppliers = supplier;
    },
};

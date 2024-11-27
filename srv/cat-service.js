const cds = require('@sap/cds')


module.exports = cds.service.impl(async function (params) {
    const { Books } = this.entities;
    const workflow = require('./helper/workflow');

    this.on('CREATE', Books, async (req) => {
        try {
            const bookData = req.data; // Retrieve POST request 

            console.log('Received data for new book:', bookData);

            // Validation: Ensure all required fields are provided

            // if (!bookData.title || bookData.stock == null) {
            //     req.error(400, 'Both "title" and "stock" fields are required.');
            // }

            // Validation: Check for valid stock
            // if (bookData.stock < 0) {
            //     req.error(400, '"stock" cannot be negative.');
            // }

            // Insert the book into the database
            const result = await cds.transaction(req).run(
                INSERT.into(Books).entries(bookData)
            );

            try {
                console.log(`[INFO] Initiating workflow posting for new record: ${JSON.stringify(bookData)}`);
                await workflow._postWorkFlow(bookData, Books);
                console.log(`[INFO] Workflow posted successfully for title: ${result}`);
            } catch (workflowError) {
                console.error(`[ERROR] Workflow posting failed for title: ${result} - ${workflowError.message}`);
            }

            // Return the created book record

            return result;
        } catch (error) {
            console.error('Error during the CREATE operation:', error);
            req.error(500, 'Internal Server Error');
        }

    });

    this.on('updateData', async (req) => {
        const { stock, id } = req.data;

        // Ensure the necessary data is provided
        if (!id || stock == null) {
            return "id and stock are required fields.";
        }

        try {
            const db = cds.tx(req);
            const result = await db.run(
                UPDATE(Books) // Replace with your entity name
                    .set({ stock: stock })
                    .where({ id: id })
            );

            if (result === 0) {
                return `No record found with id ${id}.`;
            }

            return `Record with id ${id} successfully updated.`;
        } catch (error) {
            console.error(error);
            return `Failed to update record: ${error.message}`;
        }

    })
})

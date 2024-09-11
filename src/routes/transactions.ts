import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knexInstance } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function transactionsRoutes(app: FastifyInstance) {
    // Exemplo middleware
    // app.addHook('preHandler', async (request, reply) => {
    //     console.log(`[${request.method}] ${request.url}`)
    // })

    app.get(
        '/',
        {
            preHandler: [checkSessionIdExists],
        },
        async (request, reply) => {
            const sessionId = request.cookies.session_id

            const transactions = await knexInstance('transactions')
                .where('session_id', sessionId)
                .select('*')

            return reply.status(200).send({ transactions })
        },
    )

    app.get(
        '/:id',
        {
            preHandler: [checkSessionIdExists],
        },
        async (request, reply) => {
            const getTransactionBodySchema = z.object({
                id: z.string().uuid(),
            })

            const { id } = getTransactionBodySchema.parse(request.params)

            const sessionId = request.cookies.session_id

            const transaction = await knexInstance('transactions')
                .where({
                    id,
                    session_id: sessionId,
                })
                .first()

            if (!transaction) {
                return reply.status(404).send()
            }

            return reply.status(200).send({ transaction })
        },
    )

    app.get(
        '/summary',
        {
            preHandler: [checkSessionIdExists],
        },
        async (request, reply) => {
            const sessionId = request.cookies.session_id
            const summary = await knexInstance('transactions')
                .where('session_id', sessionId)
                .sum('amount', {
                    as: 'amount',
                })
                .first()

            return reply.status(200).send({ summary })
        },
    )

    app.post('/', async (request, reply) => {
        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit']),
        })

        const { title, amount, type } = createTransactionBodySchema.parse(
            request.body,
        )

        let sessionId = request.cookies.session_id

        if (!sessionId) {
            sessionId = crypto.randomUUID()
            reply.cookie('session_id', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            })
        }

        await knexInstance('transactions').insert({
            id: crypto.randomUUID(),
            title,
            amount: type === 'credit' ? amount : amount * -1,
            session_id: sessionId,
        })

        return reply.status(201).send()
    })
}

import { FastifyReply, FastifyRequest } from 'fastify'

export function checkSessionIdExists(
    request: FastifyRequest,
    reply: FastifyReply,
    next: () => void,
) {
    const sessionId = request.cookies.session_id

    if (!sessionId) {
        return reply.status(401).send({
            error: 'Unauthorized.',
        })
    }

    next()
}

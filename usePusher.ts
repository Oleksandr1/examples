import { defineStore } from 'pinia'
import Pusher from 'pusher-js'
import { usePostsStore } from '@/store/usePosts'
import { config } from '../../config'

export const usePusherStore = defineStore('pusher', {
    state: () => ({
        pusher: null as any,
        channelSimulation: null as any,
        channelUser: null as any,
        activePostId: null,
    }),
    actions: {
        initPusher() {
            if (
                localStorage.getItem('pusher_key') &&
                localStorage.getItem('pusher_cluster') &&
                !this.pusher
            ) {
                this.pusher = new Pusher(localStorage.getItem('pusher_key') || '', {
                    cluster: localStorage.getItem('pusher_cluster'),
                    channelAuthorization: {
                        endpoint: `${config.backendUrl}broadcasting/auth`,
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token') || ''} `,
                        },
                    },
                } as any)
            } else {
                console.error('pusher_key or pusher_cluster not found in localStorage')
            }
        },
        subscribeToSimulationChannel(simulationId: number) {
            this.channelSimulation = this.pusher.subscribe(`private-simulation-${simulationId}`)
            this.pusher.bind('post-new', async (data: any) => {
                const postStore = usePostsStore()
                await postStore.getPosts(simulationId)
                console.log('data from pusher 1', data)
                postStore.selectedPostId = data.id
                postStore.selectedPost = data
            })
        },

        // subscribeToUserChannel(userId: number) {
            // this.channelUser = this.pusher?.subscribe(`user-${userId}`)
        // },
    },
})

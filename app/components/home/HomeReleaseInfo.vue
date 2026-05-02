<script setup lang="ts">
import { isToday, parseISO } from 'date-fns'
import type { CalendarEntry } from '@/types/schedule'
import { slugify } from '@/utils/slugify'

const props = defineProps<{
    item: CalendarEntry
}>()

const statusLabel = computed(() => {
    if (!props.item.next_episode_at) return 'СКОРО'
    const date = parseISO(props.item.next_episode_at)
    return isToday(date) ? 'ВЫХОДИТ СЕГОДНЯ' : 'ВЫХОДИТ ЗАВТРА'
})

const posterUrl = computed(() => {
    const poster = props.item.anime.poster?.originalUrl || props.item.anime.poster?.mainUrl
    if (poster) return poster
    
    // Fallback to image.original if poster is missing (Calendar API)
    const anime = props.item.anime as any
    if (anime.image?.original && !anime.image.original.includes('missing'))
      return `https://shikimori.io${anime.image.original}`
    if (anime.image?.preview && !anime.image.preview.includes('missing'))
      return `https://shikimori.io${anime.image.preview}`
    
    return ''
})
</script>

<template>
    <div class="release" v-if="item">
        <!-- Background: mobile = split, desktop = full poster -->
        <div class="release-bg">
            <div class="release-bg-solid"></div>
            <div class="release-bg-poster" :style="{ backgroundImage: `url(${posterUrl})` }">
                <div class="release-bg-overlay"></div>
            </div>
        </div>

        <div class="release-container">
            <div class="release-inner">
                <!-- Left: text content -->
                <div class="release-content">
                    <div class="release-badge">
                        <Icon name="mdi:clock-outline" size="16" />
                        <span>{{ statusLabel }}</span>
                    </div>

                    <h2 class="release-title">{{ item.anime.russian || item.anime.name }}</h2>

                    <div class="release-meta">
                        <span class="release-star">
                            <Icon name="mdi:star" size="14" />
                        </span>
                        <span class="release-rating-value">{{ item.anime.score }}</span>
                        <span class="release-dot" v-if="item.anime.airedOn?.year">•</span>
                        <span v-if="item.anime.airedOn?.year">{{ item.anime.airedOn.year }}</span>
                        <span class="release-dot" v-if="item.anime.kind">•</span>
                        <span v-if="item.anime.kind">{{ item.anime.kind?.toUpperCase() }}</span>
                        <span class="release-dot" v-if="item.anime.episodes">•</span>
                        <span v-if="item.anime.episodes">{{ item.next_episode }} эп.</span>
                    </div>

                    <div class="release-genres" v-if="item.anime.genres?.length">
                        <span v-for="genre in item.anime.genres.slice(0, 4)" :key="genre.id" class="release-genre">
                            {{ genre.russian }}
                        </span>
                    </div>

                    <NuxtLink :to="`/animes/${item.anime.id}-${slugify(item.anime.name)}`" class="release-button">
                        <Icon name="mdi:play" size="20" />
                        <span>Смотреть</span>
                    </NuxtLink>
                </div>

                <!-- Right: poster card (desktop only) -->
                <div class="release-poster">
                    <img :src="posterUrl" :alt="item.anime.russian || item.anime.name" />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.release {
    position: relative;
    min-height: 340px;
    overflow: hidden;

    @include respond(tablet-l) {
        margin-top: 70px;
    }

    @include respond(tablet) {
        min-height: 400px;
    }

    &-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        filter: brightness(0.2);

        &-solid {
            position: absolute;
            inset: 0;
            background: var(--surface);
        }

        &-poster {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            right: 0;
            background-size: cover;
            background-position: center 50%;
            background-repeat: no-repeat;
        }

        &-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
                to right,
                var(--bg) 0%,
                var(--bg) 35%,
                rgba(var(--bg-rgb), 0.95) 50%,
                rgba(var(--bg-rgb), 0.7) 75%,
                rgba(var(--bg-rgb), 0.4) 100%
            );
        }
    }

    &-container {
        position: relative;
        z-index: 2;
        width: 100%;
        min-height: 340px;

        @include respond(tablet) {
            max-width: 1440px;
            margin: 0 auto;
            padding: 0 15px;
            min-height: 400px;
        }
    }

    &-inner {
        display: flex;
        align-items: center;
        min-height: 340px;

        @include respond(tablet) {
            justify-content: space-between;
            min-height: 400px;
        }
    }

    &-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 12px;
        padding: 32px 24px;
        width: 100%;

        @include respond(tablet) {
            padding: 40px 0;
            max-width: 600px;
        }
    }

    &-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background-color: var(--accent);
        color: #fff;
        padding: 6px 14px;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        width: fit-content;
    }

    &-title {
        font-size: 1.75rem;
        font-weight: 800;
        color: var(--text);
        line-height: 1.2;
        margin: 4px 0;
        
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        min-height: 2.4em; /* Ensure 2 lines height for uniformity */

        @include respond(tablet) {
            font-size: 2.25rem;
        }
    }

    &-meta {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8125rem;
        color: var(--muted);

        @include respond(tablet) {
            font-size: 0.875rem;
        }
    }

    &-star {
        color: var(--accent);
        display: inline-flex;
        align-items: center;
    }

    &-rating-value {
        color: var(--accent);
        font-weight: 600;
    }

    &-dot {
        color: var(--muted);
        font-size: 0.625rem;
    }

    &-genres {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    &-genre {
        display: inline-block;
        padding: 4px 12px;
        border: 1px solid var(--border);
        border-radius: 20px;
        font-size: 0.75rem;
        color: var(--muted);
        line-height: 1.6;
    }

    &-button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background-color: var(--accent);
        color: #fff;
        padding: 12px 28px;
        border-radius: 12px;
        font-size: 0.9375rem;
        font-weight: 700;
        width: fit-content;
        margin-top: 8px;
        transition: all 0.2s ease;

        &:hover {
            background-color: var(--accent2);
            transform: translateY(-2px);
        }

        &:active {
            transform: scale(0.97);
        }
    }

    &-poster {
        display: none;

        @include respond(tablet) {
            display: block;
            flex-shrink: 0;
            width: 220px;
            height: 320px;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }
    }
}
</style>
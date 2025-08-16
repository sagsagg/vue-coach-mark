<template>
  <QTooltip
    :key="`tooltip-${refreshKey}`"
    v-model="visible"
    :target="target"
    :anchor="anchor"
    :self="self"
    :offset="offset"
    :delay="1000"
    :hide-delay="50"
    no-parent-event
    class="mint-coach-mark-quasar-tooltip"
    :class="className"
    @show="$emit('show')"
    @hide="$emit('hide')"
  >
    <div class="mint-coach-mark-quasar-wrapper">
      <!-- Title -->
      <div v-if="step?.popover?.title" class="mint-coach-mark-quasar-title">
        <slot name="title" :step="step" :index="stepIndex">
          {{ step?.popover?.title }}
        </slot>
      </div>

      <!-- Description -->
      <div v-if="step?.popover?.description" class="mint-coach-mark-quasar-description">
        <slot name="content" :step="step" :index="stepIndex">
          {{ step?.popover?.description }}
        </slot>
      </div>

      <!-- Progress -->
      <div v-if="step?.popover?.showProgress" class="mint-coach-mark-quasar-progress">
        <slot name="progress" :step="step" :index="stepIndex" :total="totalSteps">
          <div class="mint-coach-mark-quasar-progress-text">
            {{ progressText }}
          </div>
        </slot>
      </div>

      <!-- Buttons -->
      <div class="mint-coach-mark-quasar-footer">
        <slot name="skip-button" :step="step" :index="stepIndex">
          <button
            v-if="shouldShowSkipButton"
            @click="$emit('skip')"
            class="mint-coach-mark-quasar-btn mint-coach-mark-quasar-btn--skip"
            :disabled="disableButtons.includes('skip')"
          >
            {{ skipBtnText }}
          </button>
        </slot>

        <slot name="prev-button" :step="step" :index="stepIndex">
          <button
            v-if="showButtons.includes('previous')"
            @click="$emit('previous')"
            class="mint-coach-mark-quasar-btn mint-coach-mark-quasar-btn--prev"
            :disabled="disableButtons.includes('previous') || (stepIndex || 0) === 0"
          >
            {{ step?.popover?.prevBtnText || 'Previous' }}
          </button>
        </slot>

        <slot name="next-button" :step="step" :index="stepIndex">
          <button
            v-if="showButtons.includes('next')"
            @click="$emit('next')"
            class="mint-coach-mark-quasar-btn mint-coach-mark-quasar-btn--next"
            :disabled="disableButtons.includes('next')"
          >
            {{ step?.popover?.nextBtnText || (isLastStep ? 'Done' : 'Next') }}
          </button>
        </slot>

        <slot name="close-icon">
          <button
            v-if="showButtons.includes('close')"
            @click="$emit('close')"
            class="mint-coach-mark-quasar-btn mint-coach-mark-quasar-btn--close"
            :disabled="disableButtons.includes('close')"
            aria-label="Close"
          >
            ×
          </button>
        </slot>
      </div>
    </div>
  </QTooltip>
</template>

<script setup lang="ts">
import { QTooltip } from 'quasar';
import type { QTooltipProps } from 'quasar';
import type { CoachMarkStep } from '../types';

// v-model for visibility
const visible = defineModel<boolean>({ required: true });

// Props interface
interface PopoverProps {
  readonly refreshKey: string | number;
  readonly target?: Element;
  readonly anchor: QTooltipProps['anchor'];
  readonly self: QTooltipProps['self'];
  readonly offset: QTooltipProps['offset'];
  readonly className?: string | string[];
  readonly step?: CoachMarkStep;
  readonly stepIndex?: number;
  readonly totalSteps: number;
  readonly isLastStep: boolean;
  readonly showButtons: readonly string[];
  readonly disableButtons: readonly string[];
  readonly shouldShowSkipButton: boolean;
  readonly skipBtnText: string;
  readonly progressText: string;
}

defineProps<PopoverProps>();

// Emits for button and tooltip lifecycle
interface PopoverEmits {
  (e: 'show'): void;
  (e: 'hide'): void;
  (e: 'next'): void;
  (e: 'previous'): void;
  (e: 'skip'): void;
  (e: 'close'): void;
}

defineEmits<PopoverEmits>();

// Slots typing for better DX
interface PopoverSlots {
  title?: (scope: { step: CoachMarkStep | undefined; index: number | undefined }) => unknown;
  content?: (scope: { step: CoachMarkStep | undefined; index: number | undefined }) => unknown;
  progress?: (scope: { step: CoachMarkStep | undefined; index: number | undefined; total: number }) => unknown;
  'skip-button'?: (scope: { step: CoachMarkStep | undefined; index: number | undefined }) => unknown;
  'prev-button'?: (scope: { step: CoachMarkStep | undefined; index: number | undefined }) => unknown;
  'next-button'?: (scope: { step: CoachMarkStep | undefined; index: number | undefined }) => unknown;
  'close-icon'?: () => unknown;
}

defineSlots<PopoverSlots>();
</script>


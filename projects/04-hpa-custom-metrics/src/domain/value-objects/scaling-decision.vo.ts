/**
 * Value Object: ScalingDecision
 * Represents a scaling decision based on metrics
 */
export enum ScalingAction {
  SCALE_UP = 'scale_up',
  SCALE_DOWN = 'scale_down',
  NO_ACTION = 'no_action',
}

export class ScalingDecisionVO {
  constructor(
    public readonly action: ScalingAction,
    public readonly currentReplicas: number,
    public readonly targetReplicas: number,
    public readonly reason: string,
    public readonly metricValue: number,
    public readonly threshold: number,
  ) {}

  static scaleUp(
    currentReplicas: number,
    targetReplicas: number,
    metricValue: number,
    threshold: number,
  ): ScalingDecisionVO {
    return new ScalingDecisionVO(
      ScalingAction.SCALE_UP,
      currentReplicas,
      targetReplicas,
      `Metric value ${metricValue} exceeds threshold ${threshold}`,
      metricValue,
      threshold,
    );
  }

  static scaleDown(
    currentReplicas: number,
    targetReplicas: number,
    metricValue: number,
    threshold: number,
  ): ScalingDecisionVO {
    return new ScalingDecisionVO(
      ScalingAction.SCALE_DOWN,
      currentReplicas,
      targetReplicas,
      `Metric value ${metricValue} below threshold ${threshold}`,
      metricValue,
      threshold,
    );
  }

  static noAction(
    currentReplicas: number,
    metricValue: number,
    threshold: number,
  ): ScalingDecisionVO {
    return new ScalingDecisionVO(
      ScalingAction.NO_ACTION,
      currentReplicas,
      currentReplicas,
      `Metric value ${metricValue} within threshold ${threshold}`,
      metricValue,
      threshold,
    );
  }

  shouldScale(): boolean {
    return this.action !== ScalingAction.NO_ACTION;
  }
}



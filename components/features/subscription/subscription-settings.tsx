'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Calendar, CreditCard, Loader2, Settings } from 'lucide-react';
import { useSubscription } from '@/hooks/use-subscription';
import { 
  formatPrice, 
  getPlanDisplayName, 
  getSubscriptionStatusDisplay, 
  isSubscriptionActive,
  isSubscriptionExpiringSoon,
  getDaysUntilExpiry,
  formatInterval 
} from '@/lib/stripe/utils';

export function SubscriptionSettings() {
  const {
    subscription,
    isLoadingSubscription,
    cancelSubscription,
    isCancelingSubscription,
    reactivateSubscription,
    isReactivatingSubscription,
    openBillingPortal,
    isLoading,
    hasActiveSubscription,
  } = useSubscription();

  if (isLoadingSubscription) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Failed to load subscription data</p>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = subscription.subscription 
    ? getSubscriptionStatusDisplay(subscription.subscription.status)
    : null;

  const isActive = subscription.subscription 
    ? isSubscriptionActive(
        subscription.subscription.status, 
        subscription.subscription.cancelAtPeriodEnd,
        new Date(subscription.subscription.currentPeriodEnd)
      )
    : false;

  const isExpiringSoon = subscription.subscription
    ? isSubscriptionExpiringSoon(
        subscription.subscription.cancelAtPeriodEnd,
        new Date(subscription.subscription.currentPeriodEnd)
      )
    : false;

  const daysUntilExpiry = subscription.subscription
    ? getDaysUntilExpiry(new Date(subscription.subscription.currentPeriodEnd))
    : 0;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {getPlanDisplayName(subscription.plan)}
              </h3>
              {subscription.subscription && (
                <p className="text-sm text-muted-foreground">
                  {formatPrice(subscription.subscription.amount, subscription.subscription.currency)}
                  /{formatInterval(subscription.subscription.interval)}
                </p>
              )}
            </div>
            {statusInfo && (
              <Badge 
                variant={
                  statusInfo.color === 'green' ? 'default' :
                  statusInfo.color === 'red' ? 'destructive' :
                  'secondary'
                }
              >
                {statusInfo.label}
              </Badge>
            )}
          </div>

          {/* Subscription Details */}
          {subscription.subscription && (
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Billing cycle:</span>
                <span>{formatInterval(subscription.subscription.interval)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next billing date:</span>
                <span>
                  {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Credits:</span>
                <span>{subscription.credits.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Warnings */}
          {isExpiringSoon && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Your subscription will expire in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Subscription Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasActiveSubscription && (
            <>
              <Button
                variant="outline"
                className="w-full"
                onClick={openBillingPortal}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Manage Billing
                  </>
                )}
              </Button>

              <Separator />

              {subscription.subscription?.cancelAtPeriodEnd ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Your subscription is scheduled to cancel on{' '}
                    {subscription.subscription && new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => reactivateSubscription()}
                    disabled={isReactivatingSubscription}
                  >
                    {isReactivatingSubscription ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Reactivating...
                      </>
                    ) : (
                      'Reactivate Subscription'
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => cancelSubscription()}
                  disabled={isCancelingSubscription}
                >
                  {isCancelingSubscription ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Canceling...
                    </>
                  ) : (
                    'Cancel Subscription'
                  )}
                </Button>
              )}
            </>
          )}

          {!hasActiveSubscription && (
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                You don&apos;t have an active subscription
              </p>
              <Button
                variant="default"
                className="w-full"
                onClick={() => window.location.href = '/pricing'}
              >
                View Plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Usage & Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Available Credits</span>
            <span className="text-2xl font-bold">{subscription.credits}</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Credits reset on:{' '}
            {new Date(subscription.creditsResetAt).toLocaleDateString()}
          </div>

          {/* Progress bar could be added here showing credit usage */}
        </CardContent>
      </Card>
    </div>
  );
}